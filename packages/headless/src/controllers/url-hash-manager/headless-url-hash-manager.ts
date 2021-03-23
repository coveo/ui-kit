import {Schema, StringValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {
  restoreSearchParameters,
  SearchParameters,
} from '../../features/search-parameters/search-parameter-actions';
import {SearchParametersState} from '../../state/search-app-state';
import {validateInitialState} from '../../utils/validate-payload';
import {buildController, Controller} from '../controller/headless-controller';
import {executeSearch} from '../../features/search/search-actions';
import {ConfigurationSection} from '../../state/state-sections';
import {logSearchboxSubmit} from '../../features/query/query-analytics-actions';
import {
  AnalyticsType,
  makeNoopAnalyticsAction,
} from '../../features/analytics/analytics-utils';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {
  logFacetClearAll,
  logFacetDeselect,
  logFacetSelect,
} from '../../features/facets/facet-set/facet-set-analytics-actions';
import {buildSearchParameterSerializer} from '../../features/search-parameters/search-parameter-serializer';
import {
  buildSearchParameterManager,
  getInitialSearchParameterState,
} from '../search-parameter-manager/headless-search-parameter-manager';

export interface UrlHashManagerProps {
  /**
   * The initial state that should be applied to the `UrlHashManager` controller.
   */
  initialState: UrlHashManagerInitialState;
}

export interface UrlHashManagerInitialState {
  /**
   * The url hash containing the parameters affecting the search response.
   */
  urlHash: string;
}

const urlHashValue = new StringValue({regex: /^#|^$/});
const initialStateSchema = new Schema<Required<UrlHashManagerInitialState>>({
  urlHash: urlHashValue,
});

/**
 * The `UrlHashManager` controller allows managing an url hash which affect the search response.
 * */
export interface UrlHashManager extends Controller {
  /**
   * The state relevant to the `UrlHashManager` controller.
   * */
  state: UrlHashManagerState;
  /**
   * Updates the search parameters from the url hash & launches a search.
   * @param urlHash The url hash containing the parameters affecting the search.
   */
  updateUrlHash(urlHash: string): void;
}

export interface UrlHashManagerState {
  /**
   * The url hash containing the parameters affecting the search response.
   */
  urlHash: string;
}

/**
 * Creates a `UrlHashManager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `UrlHashManager` properties.
 * @returns A `UrlHashManager` controller instance.
 */
export function buildUrlHashManager(
  engine: Engine<Partial<SearchParametersState> & ConfigurationSection>,
  props: UrlHashManagerProps
): UrlHashManager {
  const {dispatch} = engine;
  const controller = buildController(engine);

  validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildUrlHashManager'
  );

  const parameters = {
    ...getInitialSearchParameterState(engine),
    ...getSearchParameterStateFromUrlHash(props.initialState.urlHash),
  };
  const searchParameterManager = buildSearchParameterManager(engine, {
    initialState: {
      parameters,
    },
  });

  return {
    ...controller,

    get state() {
      return {
        urlHash: buildSearchParameterSerializer().serialize(
          searchParameterManager.state.parameters
        ),
      };
    },

    updateUrlHash(urlHash: string) {
      const validation = urlHashValue.validate(urlHash);
      if (validation) {
        engine.logger.error(validation, urlHash, 'updateUrlHash');
        return;
      }

      const initialParameters = getInitialSearchParameterState(engine);
      const previousParameters = {
        ...initialParameters,
        ...searchParameterManager.state.parameters,
      };
      const newParameters = {
        ...initialParameters,
        ...getSearchParameterStateFromUrlHash(urlHash),
      };
      dispatch(restoreSearchParameters(newParameters));
      dispatch(
        executeSearch(
          getRelevantAnalyticsAction(previousParameters, newParameters)
        )
      );
    },
  };
}

function getSearchParameterStateFromUrlHash(urlHash: string) {
  const urlWithoutHash = urlHash.slice(1);
  const decodedState = decodeURIComponent(urlWithoutHash);
  return buildSearchParameterSerializer().deserialize(decodedState);
}

function getRelevantAnalyticsAction(
  previousParameters: SearchParameters,
  newParameters: SearchParameters
) {
  if (previousParameters.q !== newParameters.q) {
    return logSearchboxSubmit();
  }

  if (previousParameters.sortCriteria !== newParameters.sortCriteria) {
    return logResultsSort();
  }

  if (
    JSON.stringify(previousParameters.f) !== JSON.stringify(newParameters.f)
  ) {
    return logFacetAnalyticsAction(
      previousParameters.f ?? {},
      newParameters.f ?? {}
    );
  }

  // TODO: handle range facets (nf,df)
  // TODO: handle category facets (cf)
  // TODO: handle other parameters?

  return makeNoopAnalyticsAction(AnalyticsType.Search)();
}

function logFacetAnalyticsAction(
  previousFacets: Record<string, string[]>,
  newFacets: Record<string, string[]>
) {
  const previousKeys = Object.keys(previousFacets);
  const newKeys = Object.keys(newFacets);

  const removedKeys = previousKeys.filter((key) => !newKeys.includes(key));
  if (removedKeys.length) {
    const facetId = removedKeys[0];
    return previousFacets[facetId].length > 1
      ? logFacetClearAll(facetId)
      : logFacetDeselect({facetId, facetValue: previousFacets[facetId][0]});
  }

  const addedKeys = newKeys.filter((key) => !previousKeys.includes(key));
  if (addedKeys.length) {
    const facetId = addedKeys[0];
    return logFacetSelect({facetId, facetValue: newFacets[facetId][0]});
  }

  const facetIdWithDifferentValues = newKeys.find((key) =>
    newFacets[key].filter((facetValue) =>
      previousFacets[key].includes(facetValue)
    )
  );

  if (!facetIdWithDifferentValues) {
    return makeNoopAnalyticsAction(AnalyticsType.Search)();
  }

  const previousValues = previousFacets[facetIdWithDifferentValues];
  const newValues = newFacets[facetIdWithDifferentValues];
  const addedValues = newValues.filter(
    (value) => !previousValues.includes(value)
  );

  if (addedValues.length) {
    return logFacetSelect({
      facetId: facetIdWithDifferentValues,
      facetValue: addedValues[0],
    });
  }

  const removedValues = previousValues.filter(
    (value) => !newValues.includes(value)
  );

  if (removedValues.length) {
    return logFacetDeselect({
      facetId: facetIdWithDifferentValues,
      facetValue: removedValues[0],
    });
  }

  return makeNoopAnalyticsAction(AnalyticsType.Search)();
}
