import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildCoreFacetGenerator,
  FacetGenerator,
} from '../../facets/core/headless-core-facet-generator';
import {buildProductListingFacet} from './headless-product-listing-facet';

export function buildProductListingFacetGenerator(
  engine: CommerceEngine
): FacetGenerator {
  return buildCoreFacetGenerator(engine, {
    buildFacet: buildProductListingFacet,
  });
}
