import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {buildProductListingFacet} from './headless-product-listing-facet';
import {buildCoreFacetGenerator, FacetGenerator} from '../../facets/core/headless-core-facet-generator';

export type ProductListingFacetGenerator = FacetGenerator;

export function buildProductListingFacetGenerator(engine: CommerceEngine): ProductListingFacetGenerator {
  return buildCoreFacetGenerator(engine, {
      buildFacet: buildProductListingFacet
  });
}
