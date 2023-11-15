import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildCoreFacetGenerator,
  FacetGenerator,
} from '../../facets/core/headless-core-facet-generator';
import {buildProductListingFacet} from './headless-product-listing-facet';

/**
 * Creates a product listing `FacetGenerator` instance.
 *
 * @param engine - The headless engine.
 * @returns A `FacetGenerator` controller instance.
 */
export function buildProductListingFacetGenerator(
  engine: CommerceEngine
): FacetGenerator {
  return buildCoreFacetGenerator(engine, {
    buildFacet: buildProductListingFacet,
  });
}
