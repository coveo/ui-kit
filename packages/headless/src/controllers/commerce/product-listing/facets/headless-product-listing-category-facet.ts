import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {loadReducerError} from '../../../../utils/errors';
import {
  CategoryFacet,
  buildCategoryFacet,
} from '../../core/facets/category/headless-commerce-category-facet';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {SearchableFacetOptions} from '../../core/facets/searchable/headless-commerce-searchable-facet';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';
import {commonOptions} from './headless-product-listing-facet-options';

export type ProductListingCategoryFacetBuilder =
  typeof buildProductListingCategoryFacet;

/**
 * Builds a category facet controller for a product listing page.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub
 * (CMH). The implementer is only responsible for leveraging the facet controllers created by the
 * `headless-product-listing-facet-generator` controller to properly render facets in their application.
 *
 * @param engine - The commerce engine.
 * @param options - The options for building the category facet.
 * @returns The category facet.
 */
export function buildProductListingCategoryFacet(
  engine: CommerceEngine,
  options: CommerceFacetOptions & SearchableFacetOptions
): CategoryFacet {
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCategoryFacet(engine, {
    ...options,
    ...commonOptions,
  });
}
