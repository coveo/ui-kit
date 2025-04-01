import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {productListingReducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice.js';
import {ProductListingSection} from '../../../../state/state-sections.js';

export function loadProductListingReducer(
  engine: CommerceEngine
): engine is CommerceEngine<ProductListingSection> {
  engine.addReducers({productListing});
  return true;
}
