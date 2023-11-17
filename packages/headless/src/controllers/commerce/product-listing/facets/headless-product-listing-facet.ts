import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  getProductListingAnalyticsActionForToggleFacetExclude,
  getProductListingAnalyticsActionForToggleFacetSelect,
} from '../../../../features/commerce/facets/facet-utils';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {
  logFacetClearAll,
  logFacetShowLess,
  logFacetShowMore,
} from '../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {productListingReducer as productListing} from '../../../../features/product-listing/product-listing-slice';
import {ProductListingV2Section} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {FacetValue} from '../../../core/facets/facet/headless-core-facet';
import {
  buildCoreFacet,
  Facet,
  FacetProps,
} from '../../facets/core/headless-core-facet';

/**
 * @internal
 * This initializer is used internally by the `FacetGenerator` controller.
 *
 * **Important:** This initializer is meant for internal use by Headless only. As an implementer, you should never import or use this initializer directly in your code.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Facet` properties used internally.
 * @returns A `Facet` controller instance.
 * */
export function buildProductListingFacet(
  engine: CommerceEngine,
  props: FacetProps
): Facet {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const coreController = buildCoreFacet(engine, props);

  const facetId = props.options.facetId;

  return {
    ...coreController,

    toggleSelect: (selection: FacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetSelect(facetId, selection)
      );
    },

    toggleExclude: (selection: FacetValue) => {
      coreController.toggleExclude(selection);
      dispatch(fetchProductListing());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetExclude(
          facetId,
          selection
        )
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(fetchProductListing());
      dispatch(logFacetClearAll(facetId));
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(fetchProductListing());
      dispatch(logFacetShowMore(facetId));
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchProductListing());
      dispatch(logFacetShowLess(facetId));
    },

    get state() {
      return coreController.state;
    },
  };
}

function loadFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<ProductListingV2Section> {
  engine.addReducers({productListing});
  return true;
}
