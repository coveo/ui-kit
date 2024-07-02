import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {productListingReducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {ProductListingSection} from '../../../../state/state-sections';

export function loadProductListingReducer(
  engine: CommerceEngine
): engine is CommerceEngine<ProductListingSection> {
  engine.addReducers({productListing});
  return true;
}
