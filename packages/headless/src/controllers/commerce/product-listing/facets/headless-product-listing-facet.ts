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
} from '../../../../features/facets/facet-set/facet-set-product-listing-analytics-actions';
import {buildCoreFacet, Facet, FacetProps} from '../../facets/core/headless-core-facet';
import {FacetValue} from '../../../core/facets/facet/headless-core-facet';
import {loadReducerError} from '../../../../utils/errors';
import {productListingReducer as productListing} from '../../../../features/product-listing/product-listing-slice';
import {ProductListingV2Section} from '../../../../state/state-sections';

/**
 * @internal
 * This initializer is used internally by the `FacetGenerator` controller.
 *
 * **Important:** This initializer is meant for internal use by Headless only. As an implementer, you should never import or use this initializer directly in your code.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `AutomaticFacet` properties used internally.
 * @returns An `AutomaticFacet` controller instance.
 * */
export function buildProductListingFacet(engine: CommerceEngine, props: FacetProps): Facet {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const coreController = buildCoreFacet(engine, props);

  const field = props.options.field;

  return {
    ...coreController,

    toggleSelect: (selection: FacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetSelect(
          field,
          selection
        )
      );
    },

    toggleExclude: (selection: FacetValue) => {
      coreController.toggleExclude(selection);
      dispatch(fetchProductListing());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetExclude(
          field,
          selection
        )
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(fetchProductListing());
      dispatch(logFacetClearAll(field));
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowMore(field))
      );
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowLess(field))
      );
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
