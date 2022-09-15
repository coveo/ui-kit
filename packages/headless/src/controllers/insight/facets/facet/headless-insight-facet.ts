import {
  executeSearch,
  fetchFacetValues,
} from '../../../../features/insight-search/insight-search-actions';
import {FacetSortCriterion} from '../../../../features/facets/facet-set/interfaces/request';
import {
  FacetOptions,
  FacetSearchOptions,
  facetOptionsSchema,
} from './headless-insight-facet-options';
import {FacetValueState} from '../../../../features/facets/facet-api/value';
import {
  buildCoreFacet,
  CoreFacet,
  CoreFacetState,
  Facet,
  FacetProps,
  FacetSearch,
  FacetSearchState,
  FacetState,
  FacetValue,
  SpecificFacetSearchResult,
} from '../../../core/facets/facet/headless-core-facet';
import {
  facetSet,
  configuration,
  facetSearchSet,
  search,
} from '../../../../app/reducers';
import {
  FacetSection,
  ConfigurationSection,
  FacetSearchSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {InsightEngine} from '../../../../app/insight-engine/insight-engine';
import {
  logFacetClearAll,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-insight-analytics-actions';
import {getInsightAnalyticsActionForToggleFacetSelect} from '../../../../features/facets/facet-set/facet-set-insight-utils';

export type {
  FacetOptions,
  FacetSearchOptions,
  FacetValueState,
  FacetProps,
  Facet,
  FacetState,
  FacetSearch,
  FacetSearchState,
  SpecificFacetSearchResult,
  FacetValue,
  CoreFacet,
  CoreFacetState,
};

/**
 * Creates an insight `Facet` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `Facet` properties.
 * @returns A `Facet` controller instance.
 */
export function buildFacet(
  engine: InsightEngine,
  props: FacetProps<FacetOptions>
): Facet {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const coreController = buildCoreFacet(
    engine,
    {
      ...props,
      options: {
        ...props.options,
        ...(props.options.allowedValues && {
          allowedValues: {
            type: 'simple',
            values: props.options.allowedValues,
          },
        }),
      },
    },
    facetOptionsSchema
  );
  const getFacetId = () => coreController.state.facetId;

  const createNoopFacetSearch = () => {
    return {
      updateText() {},
      showMoreResults() {},
      search() {},
      clear() {},
      updateCaptions() {},
      select() {},
      singleSelect() {},
      get state() {
        return {
          values: [],
          isLoading: false,
          moreValuesAvailable: false,
          query: '',
        };
      },
    };
  };

  const facetSearch = createNoopFacetSearch();
  const {state, ...restOfFacetSearch} = facetSearch;

  return {
    ...coreController,

    facetSearch: restOfFacetSearch,

    toggleSelect(selection) {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch(
          getInsightAnalyticsActionForToggleFacetSelect(getFacetId(), selection)
        )
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(executeSearch(logFacetClearAll(getFacetId())));
    },

    sortBy(sortCriterion: FacetSortCriterion) {
      coreController.sortBy(sortCriterion);
      dispatch(
        executeSearch(
          logFacetUpdateSort({facetId: getFacetId(), sortCriterion})
        )
      );
    },

    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(fetchFacetValues(logFacetShowMore(getFacetId())));
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchFacetValues(logFacetShowLess(getFacetId())));
    },

    get state() {
      return {
        ...coreController.state,
        facetSearch: facetSearch.state,
      };
    },
  };
}

function loadFacetReducers(
  engine: InsightEngine
): engine is InsightEngine<
  FacetSection & ConfigurationSection & FacetSearchSection & SearchSection
> {
  engine.addReducers({facetSet, configuration, facetSearchSet, search});
  return true;
}
