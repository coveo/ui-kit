import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildFacetGenerator,
  FacetGenerator,
} from '../../core/facets/generator/headless-commerce-facet-generator';
import {buildProductListingDateFacet} from './headless-product-listing-date-facet';
import {buildProductListingNumericFacet} from './headless-product-listing-numeric-facet';
import {buildProductListingRegularFacet} from './headless-product-listing-regular-facet';

/**
 * The `ProductListingFacetGenerator` headless controller creates commerce facet controllers from Commerce API
 * product listing responses.
 *
 * Commerce facets are not requested by the implementer, but rather pre-configured through the Coveo Merchandising Hub
 * (CMH). The implementer is only responsible for leveraging the facet controllers created by this controller to
 * properly render facets in their application.
 */
export interface ProductListingFacetGenerator extends FacetGenerator {}

/**
 * Creates `ProductListingFacetGenerator` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `ProductListingFacetGenerator` controller instance.
 */
export function buildProductListingFacetGenerator(
  engine: CommerceEngine
): ProductListingFacetGenerator {
  return buildFacetGenerator(engine, {
    buildRegularFacet: buildProductListingRegularFacet,
    buildNumericFacet: buildProductListingNumericFacet,
    buildDateFacet: buildProductListingDateFacet,
    // TODO: buildCategoryFacet: buildProductListingCategoryFacet,
  }) as ProductListingFacetGenerator;
}
