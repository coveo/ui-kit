import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  ProductListingV2Section,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {buildProductListingFacet} from './headless-product-listing-facet';
import {buildCoreFacetGenerator, FacetGenerator} from '../../facets/core/headless-core-facet-generator';
import {
  productListingV2Reducer as productListing
} from '../../../../features/commerce/product-listing/product-listing-slice';

export type ProductListingFacetGenerator = FacetGenerator;

export function buildProductListingFacetGenerator(engine: CommerceEngine): ProductListingFacetGenerator {
  if (!loadFacetGeneratorReducers(engine)) {
    throw loadReducerError;
  }

  return buildCoreFacetGenerator(engine, {
      buildFacet: buildProductListingFacet
  });
}

function loadFacetGeneratorReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  ProductListingV2Section
> {
  engine.addReducers({productListing});
  return true;
}
