import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {
  ProductListingEngine,
  ProductListingV2Engine,
} from '../../../app/product-listing-engine/product-listing-engine';
import {ProductListingThunkExtraArguments} from '../../../app/product-listing-thunk-extra-arguments';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {
  deselectAllAutomaticFacetValues,
  toggleSelectAutomaticFacetValue,
} from '../../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {automaticFacetSetReducer as automaticFacetSet} from '../../../features/facets/automatic-facet-set/automatic-facet-set-slice';
import {FacetValueState} from '../../../features/facets/facet-api/value';
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
import {
  fetchProductListing,
  fetchProductListingV2,
} from '../../../features/product-listing/product-listing-actions';
import {
  AutomaticFacetSection,
  ConfigurationSection,
  FacetSearchSection,
  FacetSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
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
import {
  AutomaticFacet,
  AutomaticFacetProps,
} from '../../facets/automatic-facet/headless-automatic-facet';

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

export interface FacetProps {
  /**
   * The options for the `Facet` controller.
   * */
  options: FacetOptions;
}

/**
 * Creates a `Facet` controller instance for the product listing.
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
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowMore(getFacetId()))
      );
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowLess(getFacetId()))
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

export interface Facets extends Controller {
  state: FacetsState;
}

export interface FacetsState {
  facets: AutomaticFacet[];
}

// TODO: We might need to extract a "core" automatic facets controller
export function buildFacetsV2(engine: ProductListingV2Engine): Facets {
  if (!loadAutomaticFacetBuilderReducers(engine)) {
    throw loadReducerError;
  }
  const controller = buildController(engine);

  return {
    ...controller,

    get state() {
      const facets =
        engine.state.productListing.facets.map((facet) =>
          buildAutomaticFacet(engine, {field: facet.field})
        ) ?? [];
      return {
        facets,
      };
    },
  };
}

export function buildAutomaticFacet(
  engine: ProductListingV2Engine,
  props: AutomaticFacetProps
): AutomaticFacet {
  const {dispatch} = engine;
  const controller = buildController(engine);

  const {field} = props;

  return {
    ...controller,

    toggleSelect(selection: FacetValue) {
      dispatch(toggleSelectAutomaticFacetValue({field, selection}));
      dispatch(fetchProductListingV2());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetSelect(field, selection)
      );
    },

    deselectAll() {
      dispatch(deselectAllAutomaticFacetValues(field));
      dispatch(fetchProductListingV2());
    },

    get state() {
      const response = engine.state.automaticFacetSet?.set[field]?.response;

      const defaultState = {field: '', values: [], label: ''};

      return response
        ? {
            field: response.field,
            label: response.label,
            values: response.values,
          }
        : defaultState;
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

function loadAutomaticFacetBuilderReducers(
  engine: CoreEngine
): engine is CoreEngine<
  AutomaticFacetSection & ConfigurationSection,
  ProductListingThunkExtraArguments
> {
  engine.addReducers({automaticFacetSet, configuration});
  return true;
}
