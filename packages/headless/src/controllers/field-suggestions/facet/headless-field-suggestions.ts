import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {registerFacet} from '../../../features/facets/facet-set/facet-set-actions';
import {
  logFacetExclude,
  logFacetSelect,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice';
import {defaultFacetOptions} from '../../../features/facets/facet-set/facet-set-slice';
import {executeSearch} from '../../../features/search/search-actions';
import {searchReducer as search} from '../../../features/search/search-slice';
import {
  FacetSection,
  ConfigurationSection,
  FacetSearchSection,
  SearchSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Subscribable,
} from '../../controller/headless-controller';
import {determineFacetId} from '../../core/facets/_common/facet-id-determinor';
import {buildFacetSearch} from '../../core/facets/facet-search/specific/headless-facet-search';
import {FacetOptions} from '../../facets/facet/headless-facet-options';

export interface FieldSuggestionsValue {
  /**
   * The custom field suggestion display name, as specified in the `captions` argument of the `FieldSuggestion` controller.
   */
  displayValue: string;
  /**
   * The original field value, as retrieved from the field in the index.
   */
  rawValue: string;
  /**
   * An estimated number of result items matching both the current query and
   * the filter expression that would get generated if this field suggestion was selected.
   */
  count: number;
}

export interface FieldSuggestionsState {
  /**
   * The field suggestions.
   */
  values: FieldSuggestionsValue[];

  /**
   * Whether the request for field suggestions is in progress.
   */
  isLoading: boolean;

  /**
   * Whether more field suggestions are available.
   */
  moreValuesAvailable: boolean;

  /**
   * The query used to request field suggestions.
   */
  query: string;
}

/**
 * The `FieldSuggestions` controller provides query suggestions based on a particular facet field.
 *
 * For example, you could use this controller to provide auto-completion suggestions while the end user is typing an item title.
 *
 * This controller is a wrapper around the basic facet controller search functionality, and thus exposes similar options and properties.
 */
export interface FieldSuggestions extends Subscribable {
  /**
   * Requests field suggestions based on a query.
   *
   * @param text - The query to search.
   */
  updateText(text: string): void;

  /**
   * Shows more field suggestions for the current query.
   */
  showMoreResults(): void;

  /**
   * Requests field suggestions based on a query.
   */
  search(): void;

  /**
   * Filters the search using the specified value.
   *
   * If a facet exists with the configured `facetId`, selects the corresponding facet value.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   */
  select(value: FieldSuggestionsValue): void;

  /**
   * Filters the search using the specified value, deselecting others.
   *
   * If a facet exists with the configured `facetId`, selects the corresponding facet value while deselecting other facet values.
   *
   * @param value - The field suggestion for which to select the matching facet value.
   */
  singleSelect(value: FieldSuggestionsValue): void;

  /**
   * Resets the query and empties the suggestions.
   */
  clear(): void;

  /**
   * Updates the captions of field suggestions.
   *
   * @param captions - A dictionary that maps field values to field suggestion display names.
   */
  updateCaptions(captions: Record<string, string>): void;

  state: FieldSuggestionsState;
}

export interface FieldSuggestionsOptions {
  /**
   * The options used to register the facet used by the field suggestions controller.
   */
  facet: FacetOptions;
}

export interface FieldSuggestionsProps {
  /**
   * The options for the `FieldSuggestions` controller.
   */
  options: FieldSuggestionsOptions;
}

/**
 * Creates a `FieldSuggestions` controller instance.
 *
 * This controller initializes a facet under the hood, but exposes state and methods that are relevant for suggesting field values based on a query.
 * It's important not to initialize a facet with the same `facetId` but different options, because only the options of the controller which is built first will be taken into account.
 *
 * @param engine The headless engine.
 * @param props The configurable `FieldSuggestions` controller properties.
 * @returns A `FieldSuggestions` controller instance.
 */
export function buildFieldSuggestions(
  engine: SearchEngine,
  props: FieldSuggestionsProps
): FieldSuggestions {
  if (!loadFieldSuggestionsReducers(engine)) {
    throw loadReducerError;
  }
  const {
    facetSearch: facetSearchOptions,
    allowedValues,
    ...facetOptions
  } = props.options.facet;
  const facetId = determineFacetId(engine, facetOptions);
  engine.dispatch(
    registerFacet({
      ...defaultFacetOptions,
      ...facetOptions,
      facetId,
      ...(allowedValues && {
        allowedValues: {
          type: 'simple',
          values: allowedValues,
        },
      }),
    })
  );

  const facetSearch = buildFacetSearch(engine, {
    options: {...facetSearchOptions, facetId},
    select: (value) => {
      engine.dispatch(updateFacetOptions());
      engine.dispatch(
        executeSearch(logFacetSelect({facetId, facetValue: value.rawValue}))
      );
    },
    exclude: (value) => {
      engine.dispatch(updateFacetOptions());
      engine.dispatch(
        executeSearch(logFacetExclude({facetId, facetValue: value.rawValue}))
      );
    },
    isForFieldSuggestions: true,
  });
  const controller = buildController(engine);
  return {
    ...controller,
    ...facetSearch,
    updateText: function (text: string) {
      facetSearch.updateText(text);
      facetSearch.search();
    },
    get state() {
      return facetSearch.state;
    },
  };
}

function loadFieldSuggestionsReducers(
  engine: CoreEngine
): engine is CoreEngine<
  FacetSection & ConfigurationSection & FacetSearchSection & SearchSection,
  SearchThunkExtraArguments
> {
  engine.addReducers({facetSet, configuration, facetSearchSet, search});
  return true;
}
