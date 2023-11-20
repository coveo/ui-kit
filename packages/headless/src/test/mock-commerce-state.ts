import {getCartInitialState} from '../features/commerce/context/cart/cart-state';
import {getContextInitialState} from '../features/commerce/context/context-state';
import {getCommerceFacetSetInitialState} from '../features/commerce/facets/facet-set/facet-set-state';
import {getCommercePaginationInitialState} from '../features/commerce/pagination/pagination-state';
import {getProductListingV2InitialState} from '../features/commerce/product-listing/product-listing-state';
import {getCommerceQueryInitialState} from '../features/commerce/query/query-state';
import {getCommerceSearchInitialState} from '../features/commerce/search/search-state';
import {getCommerceSortInitialState} from '../features/commerce/sort/sort-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getFacetOrderInitialState} from '../features/facets/facet-order/facet-order-state';
import {getNumericFacetSetInitialState} from '../features/facets/range-facets/numeric-facet-set/numeric-facet-set-state';
import {CommerceAppState} from '../state/commerce-app-state';

export function buildMockCommerceState(
  config: Partial<CommerceAppState> = {}
): CommerceAppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingV2InitialState(),
    commerceSearch: getCommerceSearchInitialState(),
    commerceQuery: getCommerceQueryInitialState(),
    facetOrder: getFacetOrderInitialState(),
    commerceFacetSet: getCommerceFacetSetInitialState(),
    commercePagination: getCommercePaginationInitialState(),
    commerceSort: getCommerceSortInitialState(),
    commerceContext: getContextInitialState(),
    numericFacetSet: getNumericFacetSetInitialState(),
    cart: getCartInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
