import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildCoreFacetGenerator,
  FacetGenerator,
} from '../../facets/core/headless-core-facet-generator';
import {buildProductListingFacet} from './headless-product-listing-facet';

export type ProductListingFacetGenerator = FacetGenerator;

export function buildProductListingFacetGenerator(
  engine: CommerceEngine
): ProductListingFacetGenerator {
  return buildCoreFacetGenerator(engine, {
    buildFacet: buildProductListingFacet,
  });
}
