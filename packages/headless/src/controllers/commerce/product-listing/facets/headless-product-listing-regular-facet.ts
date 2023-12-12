import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {loadReducerError} from '../../../../utils/errors';
import {CoreCommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {
  CommerceRegularFacet,
  buildCommerceRegularFacet,
} from '../../facets/core/regular/headless-commerce-regular-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

export type ProductListingRegularFacetOptions = Omit<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'toggleSelectActionCreator'
  | 'toggleExcludeActionCreator'
>;

export type ProductListingRegularFacetBuilder =
  typeof buildProductListingRegularFacet;

export function buildProductListingRegularFacet(
  engine: CommerceEngine,
  options: ProductListingRegularFacetOptions
): CommerceRegularFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceRegularFacet(engine, {
    ...options,
    fetchResultsActionCreator: fetchProductListing,
  });
}
