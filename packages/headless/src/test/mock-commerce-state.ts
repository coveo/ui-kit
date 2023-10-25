import {getCartInitialState} from '../features/commerce/context/cart/cart-state';
import {getContextInitialState} from '../features/commerce/context/context-state';
import {getCommerceFacetsInitialState} from '../features/commerce/facets/facets-state';
import {getCommercePaginationInitialState} from '../features/commerce/pagination/pagination-state';
import {getProductListingV2InitialState} from '../features/commerce/product-listing/product-listing-state';
import {getCommerceSortInitialState} from '../features/commerce/sort/sort-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {CommerceAppState} from '../state/commerce-app-state';

export function buildMockCommerceState(
  config: Partial<CommerceAppState> = {}
): CommerceAppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingV2InitialState(),
    commerceFacets: getCommerceFacetsInitialState(),
    commercePagination: getCommercePaginationInitialState(),
    commerceSort: getCommerceSortInitialState(),
    commerceContext: getContextInitialState(),
    cart: getCartInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
