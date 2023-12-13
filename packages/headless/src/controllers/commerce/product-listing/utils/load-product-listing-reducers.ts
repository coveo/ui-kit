import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {ProductListingV2Section} from '../../../../state/state-sections';

export function loadProductListingReducer(
  engine: CommerceEngine
): engine is CommerceEngine<ProductListingV2Section> {
  engine.addReducers({productListing});
  return true;
}
