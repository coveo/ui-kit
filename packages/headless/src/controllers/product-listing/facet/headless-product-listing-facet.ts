import {CoreEngine} from '../../../app/engine';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {configuration, facetSearchSet, facetSet} from '../../../app/reducers';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {updateFacetOptions} from '../../../features/facet-options/facet-options-actions';
import {FacetValueState} from '../../../features/facets/facet-api/value';
import {
  logFacetClearAll,
  logFacetSelect,
  logFacetShowLess,
  logFacetShowMore,
  logFacetUpdateSort,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {getAnalyticsActionForToggleFacetSelect} from '../../../features/facets/facet-set/facet-set-utils';
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
  FacetProps,
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
        dispatch(updateFacetOptions({freezeFacetOrder: true}));
        dispatch(fetchProductListing()).then(() =>
          logFacetSelect({facetId: getFacetId(), facetValue: value.rawValue})
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
      dispatch(getAnalyticsActionForToggleFacetSelect(getFacetId(), selection));
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

function loadFacetReducers(
  engine: CoreEngine
): engine is CoreEngine<
  FacetSection & ConfigurationSection & FacetSearchSection,
  SearchThunkExtraArguments
> {
  engine.addReducers({facetSet, configuration, facetSearchSet});
  return true;
}
