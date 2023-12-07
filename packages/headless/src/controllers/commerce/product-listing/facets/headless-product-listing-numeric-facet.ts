import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {loadReducerError} from '../../../../utils/errors';
import {CoreCommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {
  CommerceNumericFacet,
  buildCommerceNumericFacet,
} from '../../facets/core/numeric/headless-commerce-numeric-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

export type ProductListingNumericFacetOptions = Omit<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'toggleSelectActionCreator'
  | 'toggleExcludeActionCreator'
>;

export type ProductListingNumericFacetBuilder =
  typeof buildProductListingNumericFacet;

export function buildProductListingNumericFacet(
  engine: CommerceEngine,
  options: ProductListingNumericFacetOptions
): CommerceNumericFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceNumericFacet(engine, {
    ...options,
    fetchResultsActionCreator: fetchProductListing,
  });
}
