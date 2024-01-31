import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {
  CommerceCategoryFacet,
  buildCommerceCategoryFacet,
} from '../../core/facets/category/headless-commerce-category-facet';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';
import {commonOptions} from './headless-product-listing-facet-options';

export type ProductListingCategoryFacetBuilder =
  typeof buildProductListingCategoryFacet;

export function buildProductListingCategoryFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions
): CommerceCategoryFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCommerceCategoryFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
