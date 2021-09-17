import {FacetSortCriterion} from '../../../features/facets/facet-set/interfaces/request';
import {FacetValueState} from '../../../features/facets/facet-api/value';
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
} from '../../core/facets/facet/headless-core-facet';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';
import {executeToggleFacetSelect} from '../../../features/facets/facet-set/facet-set-controller-actions';
import {CoreEngine} from '../../../app/engine';
import {
  ConfigurationSection,
  FacetSearchSection,
  FacetSection,
} from '../../../state/state-sections';
import {SearchThunkExtraArguments} from '../../../app/search-thunk-extra-arguments';
import {loadReducerError} from '../../../utils/errors';
import {getAnalyticsActionForToggleFacetSelect} from '../../../features/facets/facet-set/facet-set-utils';
import {configuration, facetSearchSet, facetSet} from '../../../app/reducers';

export {
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
};

/**
 * Creates a `Facet` controller instance.
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
  const controller = buildCoreFacet(engine, props);
  const getFacetId = () => controller.state.facetId;

  return {
    ...controller,

    toggleSelect: (selection: FacetValue) => {
      dispatch(
        executeToggleFacetSelect({
          facetId: getFacetId(),
          selection,
        })
      );
      dispatch(fetchProductListing());
      dispatch(getAnalyticsActionForToggleFacetSelect(getFacetId(), selection));
    },

    deselectAll() {
      controller.deselectAll();
      dispatch(fetchProductListing());
    },

    sortBy(criterion: FacetSortCriterion) {
      controller.sortBy(criterion);
      dispatch(fetchProductListing());
    },

    showMoreValues() {
      controller.showMoreValues();
      dispatch(fetchProductListing());
    },

    showLessValues() {
      controller.showLessValues();
      dispatch(fetchProductListing());
    },

    get state() {
      return {
        ...controller.state,
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
