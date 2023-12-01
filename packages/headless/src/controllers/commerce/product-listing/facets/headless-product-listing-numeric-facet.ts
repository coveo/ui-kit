import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {loadReducerError} from '../../../../utils/errors';
import {CoreCommerceFacetProps} from '../../facets/core/headless-core-commerce-facet';
import {
  CommerceNumericFacet,
  buildCommerceNumericFacet,
} from '../../facets/core/numeric/headless-commerce-numeric-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

export function buildProductListingNumericFacet(
  engine: CommerceEngine,
  props: CoreCommerceFacetProps
): CommerceNumericFacet {
  const coreController = buildCommerceNumericFacet(engine, {
    options: {
      ...props.options,
      fetchResultsActionCreator: fetchProductListing,
    },
  });

  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return {
    ...coreController,
  };
}
