import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {loadReducerError} from '../../../../utils/errors';
import {CoreCommerceFacetProps} from '../../facets/core/headless-core-commerce-facet';
import {
  CommerceRegularFacet,
  buildCommerceRegularFacet,
} from '../../facets/core/regular/headless-commerce-regular-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

export function buildProductListingRegularFacet(
  engine: CommerceEngine,
  props: CoreCommerceFacetProps
): CommerceRegularFacet {
  const coreController = buildCommerceRegularFacet(engine, {
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
