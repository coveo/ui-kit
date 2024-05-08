import {getCartInitialState} from '../features/commerce/context/cart/cart-state';
import {getContextInitialState} from '../features/commerce/context/context-state';
import {getCommerceFacetSetInitialState} from '../features/commerce/facets/facet-set/facet-set-state';
import {getInstantProductsInitialState} from '../features/commerce/instant-products/instant-products-state';
import {getCommercePaginationInitialState} from '../features/commerce/pagination/pagination-state';
import {getProductListingV2InitialState} from '../features/commerce/product-listing/product-listing-state';
import {getCommerceQueryInitialState} from '../features/commerce/query/query-state';
import {getRecommendationsInitialState} from '../features/commerce/recommendations/recommendations-state';
import {getCommerceSearchInitialState} from '../features/commerce/search/search-state';
import {getCommerceSortInitialState} from '../features/commerce/sort/sort-state';
import {getCommerceStandaloneSearchBoxSetInitialState} from '../features/commerce/standalone-search-box-set/standalone-search-box-set-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getFacetOrderInitialState} from '../features/facets/facet-order/facet-order-state';
import {getCategoryFacetSearchSetInitialState} from '../features/facets/facet-search-set/category/category-facet-search-set-state';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state';
import {getQuerySetInitialState} from '../features/query-set/query-set-state';
import {getQuerySuggestSetInitialState} from '../features/query-suggest/query-suggest-state';
import {getRecentQueriesInitialState} from '../features/recent-queries/recent-queries-state';
import {getTriggerInitialState} from '../features/triggers/triggers-state';
import {CommerceAppState} from '../state/commerce-app-state';

export function buildMockCommerceState(
  config: Partial<CommerceAppState> = {}
): CommerceAppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingV2InitialState(),
    recommendations: getRecommendationsInitialState(),
    commerceSearch: getCommerceSearchInitialState(),
    commerceQuery: getCommerceQueryInitialState(),
    facetOrder: getFacetOrderInitialState(),
    commerceFacetSet: getCommerceFacetSetInitialState(),
    facetSearchSet: getFacetSearchSetInitialState(),
    categoryFacetSearchSet: getCategoryFacetSearchSetInitialState(),
    commercePagination: getCommercePaginationInitialState(),
    commerceSort: getCommerceSortInitialState(),
    commerceContext: getContextInitialState(),
    recentQueries: getRecentQueriesInitialState(),
    querySuggest: getQuerySuggestSetInitialState(),
    querySet: getQuerySetInitialState(),
    cart: getCartInitialState(),
    instantProducts: getInstantProductsInitialState(),
    commerceStandaloneSearchBoxSet:
      getCommerceStandaloneSearchBoxSetInitialState(),
    triggers: getTriggerInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
