import {configuration} from '../../../../app/common-reducers.js';
import {InsightEngine} from '../../../../app/insight-engine/insight-engine.js';
import {FacetValueState} from '../../../../features/facets/facet-api/value.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {
  facetClearAll,
  facetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  logFacetClearAll,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-insight-analytics-actions.js';
import {getInsightAnalyticsActionForToggleFacetSelect} from '../../../../features/facets/facet-set/facet-set-insight-utils.js';
import {facetSetReducer as facetSet} from '../../../../features/facets/facet-set/facet-set-slice.js';
import {getAnalyticsActionForToggleFacetSelect} from '../../../../features/facets/facet-set/facet-set-utils.js';
import {FacetSortCriterion} from '../../../../features/facets/facet-set/interfaces/request.js';
import {
  executeSearch,
  fetchFacetValues,
} from '../../../../features/insight-search/insight-search-actions.js';
import {searchReducer as search} from '../../../../features/search/search-slice.js';
import {
  FacetSection,
  ConfigurationSection,
  FacetSearchSection,
  SearchSection,
} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {
  buildCoreFacet,
  CoreFacet,
  CoreFacetState,
  Facet,
  FacetSearch,
  FacetSearchState,
  FacetState,
  FacetValue,
  SpecificFacetSearchResult,
} from '../../../core/facets/facet/headless-core-facet.js';
import {
  FacetOptions,
  FacetSearchOptions,
  facetOptionsSchema,
  CoreFacetOptions,
} from './headless-insight-facet-options.js';

export type {
  FacetOptions,
  FacetSearchOptions,
  FacetValueState,
  Facet,
  FacetState,
  FacetSearch,
  FacetSearchState,
  SpecificFacetSearchResult,
  FacetValue,
  CoreFacet,
  CoreFacetState,
  CoreFacetOptions,
};

export interface FacetProps {
  /**
   * The options for the `Facet` controller.
   * */
  options: FacetOptions;
}

/**
 * Creates an insight `Facet` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `Facet` properties.
 * @returns A `Facet` controller instance.
 */
export function buildFacet(engine: InsightEngine, props: FacetProps): Facet {
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
      exclude() {},
      singleSelect() {},
      singleExclude() {},
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
        executeSearch({
          legacy: getInsightAnalyticsActionForToggleFacetSelect(
            getFacetId(),
            selection
          ),
          next: getAnalyticsActionForToggleFacetSelect(selection),
        })
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(
        executeSearch({
          legacy: logFacetClearAll(getFacetId()),
          next: facetClearAll(),
        })
      );
    },

    sortBy(sortCriterion: FacetSortCriterion) {
      coreController.sortBy(sortCriterion);
      dispatch(
        executeSearch({
          legacy: logFacetUpdateSort({facetId: getFacetId(), sortCriterion}),
          next: facetUpdateSort(),
        })
      );
    },

    isSortedBy(criterion: FacetSortCriterion) {
      return this.state.sortCriterion === criterion;
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(
        fetchFacetValues({
          legacy: logFacetShowMore(getFacetId()),
        })
      );
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(
        fetchFacetValues({
          legacy: logFacetShowLess(getFacetId()),
        })
      );
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
