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
import {getAnalyticsActionForToggleFacetSelect} from '../../../../features/facets/facet-set/facet-set-utils';
import {InsightEngine} from '../../../../app/insight-engine/insight-engine';
import {
  logFacetClearAll,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-insight-analytics-actions';

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
 * Creates an `InsightFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InsightFacet` properties.
 * @returns An `InsightFacet` controller instance.
 * */
export function buildInsightFacet(
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
          getAnalyticsActionForToggleFacetSelect(getFacetId(), selection)
        )
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(executeSearch(logFacetClearAll(getFacetId())));
    },

    sortBy(criterion: FacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch(logFacetUpdateSort({facetId: getFacetId(), criterion}))
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
