import {getCommercePaginationInitialState} from '../features/commerce/pagination/pagination-state.js';
import {getProductListingV2InitialState} from '../features/commerce/product-listing/product-listing-state.js';
import {getConfigurationInitialState} from '../features/configuration/configuration-state.js';
import {CommerceAppState} from '../state/commerce-app-state.js';
import {getContextInitialState} from '../features/commerce/context/context-state.js';
import {getCartInitialState} from '../features/commerce/context/cart/cart-state.js';

export function buildMockCommerceState(
  config: Partial<CommerceAppState> = {}
): CommerceAppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingV2InitialState(),
    commercePagination: getCommercePaginationInitialState(),
    commerceContext: getContextInitialState(),
    cart: getCartInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
