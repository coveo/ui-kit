import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {ProductListingThunkExtraArguments} from '../../../app/product-listing-thunk-extra-arguments';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {FacetValueState} from '../../../features/facets/facet-api/value';
import {
  executeFacetSearch,
  executeFieldSuggest,
} from '../../../features/facets/facet-search-set/generic/generic-facet-search-actions';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {
  logFacetClearAll,
  logFacetExclude,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../features/facets/facet-set/facet-set-product-listing-analytics-actions';
import {
  getProductListingAnalyticsActionForToggleFacetExclude,
  getProductListingAnalyticsActionForToggleFacetSelect,
} from '../../../features/facets/facet-set/facet-set-product-listing-utils';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice';
import {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {
  ConfigurationSection,
  FacetSearchSection,
  FacetSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {buildFacetSearch} from '../../core/facets/facet-search/specific/headless-facet-search';
import {
  buildCoreFacet,
  Facet,
  FacetOptions,
  FacetSearch,
  FacetSearchOptions,
  FacetSearchState,
  FacetState,
  FacetValue,
  SpecificFacetSearchResult,
  CoreFacet,
  CoreFacetState,
} from '../../core/facets/facet/headless-core-facet';

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
};

/**
 * @deprecated TBD CAPI-98
 */
export interface FacetProps {
  /**
   * The options for the `Facet` controller.
   * */
  options: FacetOptions;
}

/**
 * Creates a `Facet` controller instance for the product listing.
 * @deprecated TBD CAPI-98
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Facet` properties.
 * @returns A `Facet` controller instance.
 * */
export function buildFacet(
  engine: ProductListingEngine,
  props: FacetProps
): Facet {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const coreController = buildCoreFacet(engine, props);
  const getFacetId = () => coreController.state.facetId;

  const createFacetSearch = () => {
    const {facetSearch} = props.options;

    return buildFacetSearch(engine, {
      options: {facetId: getFacetId(), ...facetSearch},
      select: (value) => {
        dispatch(updateFacetOptions());
        dispatch(fetchProductListing()).then(() =>
          logFacetSelect({facetId: getFacetId(), facetValue: value.rawValue})
        );
      },
      exclude: (value) => {
        dispatch(updateFacetOptions());
        dispatch(fetchProductListing()).then(() =>
          logFacetExclude({facetId: getFacetId(), facetValue: value.rawValue})
        );
      },
      isForFieldSuggestions: false,
      executeFacetSearchActionCreator: executeFacetSearch,
      executeFieldSuggestActionCreator: executeFieldSuggest,
    });
  };

  const facetSearch = createFacetSearch();
  const {state, ...restOfFacetSearch} = facetSearch;

  return {
    ...coreController,

    facetSearch: restOfFacetSearch,

    toggleSelect: (selection: FacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetSelect(
          getFacetId(),
          selection
        )
      );
    },

    toggleExclude: (selection: FacetValue) => {
      coreController.toggleExclude(selection);
      dispatch(fetchProductListing());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetExclude(
          getFacetId(),
          selection
        )
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(fetchProductListing());
      dispatch(logFacetClearAll(getFacetId()));
    },

    sortBy(criterion: FacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(fetchProductListing());
      dispatch(logFacetUpdateSort({facetId: getFacetId(), criterion}));
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(fetchProductListing());
      dispatch(logFacetShowMore(getFacetId()));
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchProductListing());
      dispatch(logFacetShowLess(getFacetId()));
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
  engine: CoreEngine
): engine is CoreEngine<
  FacetSection & ConfigurationSection & FacetSearchSection,
  ProductListingThunkExtraArguments
> {
  engine.addReducers({facetSet, configuration, facetSearchSet});
  return true;
}
