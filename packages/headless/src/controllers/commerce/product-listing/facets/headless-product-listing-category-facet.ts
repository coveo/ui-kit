import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  CommerceCategoryFacet,
  buildCommerceCategoryFacet,
} from '../../facets/core/category/headless-commerce-category-facet';
import {CoreCommerceFacetOptions} from '../../facets/core/headless-core-commerce-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

export type ProductListingCategoryFacetOptions = Omit<
  CoreCommerceFacetOptions,
  | 'fetchResultsActionCreator'
  | 'toggleSelectActionCreator'
  | 'toggleExcludeActionCreator'
>;

export type ProductListingCategoryFacetBuilder =
  typeof buildProductListingCategoryFacet;

export function buildProductListingCategoryFacet(
  engine: CommerceEngine,
  options: ProductListingCategoryFacetOptions
): CommerceCategoryFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceCategoryFacet(engine, {
    ...options,
    fetchResultsActionCreator: fetchProductListing,
  });
}
