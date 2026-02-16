import {getConfigurationInitialState} from '../features/commerce/configuration/configuration-state.js';
import {getCartInitialState} from '../features/commerce/context/cart/cart-state.js';
import {getContextInitialState} from '../features/commerce/context/context-state.js';
import {getCommerceFacetSetInitialState} from '../features/commerce/facets/facet-set/facet-set-state.js';
import {getFieldSuggestionsOrderInitialState} from '../features/commerce/facets/field-suggestions-order/field-suggestions-order-state.js';
import {getManualNumericFacetInitialState} from '../features/commerce/facets/numeric-facet/manual-numeric-facet-state.js';
import {getInstantProductsInitialState} from '../features/commerce/instant-products/instant-products-state.js';
import {getCommercePaginationInitialState} from '../features/commerce/pagination/pagination-state.js';
import {getCommerceParametersInitialState} from '../features/commerce/parameters/parameters-state.js';
import {getProductEnrichmentInitialState} from '../features/commerce/product-enrichment/product-enrichment-state.js';
import {getProductListingInitialState} from '../features/commerce/product-listing/product-listing-state.js';
import {getCommerceQueryInitialState} from '../features/commerce/query/query-state.js';
import {getRecommendationsInitialState} from '../features/commerce/recommendations/recommendations-state.js';
import {getCommerceSearchInitialState} from '../features/commerce/search/search-state.js';
import {getCommerceSortInitialState} from '../features/commerce/sort/sort-state.js';
import {getCommerceStandaloneSearchBoxSetInitialState} from '../features/commerce/standalone-search-box-set/standalone-search-box-set-state.js';
import {getDidYouMeanInitialState} from '../features/did-you-mean/did-you-mean-state.js';
import {getFacetOrderInitialState} from '../features/facets/facet-order/facet-order-state.js';
import {getCategoryFacetSearchSetInitialState} from '../features/facets/facet-search-set/category/category-facet-search-set-state.js';
import {getFacetSearchSetInitialState} from '../features/facets/facet-search-set/specific/specific-facet-search-set-state.js';
import {getQuerySetInitialState} from '../features/query-set/query-set-state.js';
import {getQuerySuggestSetInitialState} from '../features/query-suggest/query-suggest-state.js';
import {getRecentQueriesInitialState} from '../features/recent-queries/recent-queries-state.js';
import {getTriggerInitialState} from '../features/triggers/triggers-state.js';
import type {CommerceAppState} from '../state/commerce-app-state.js';

export function buildMockCommerceState(
  config: Partial<CommerceAppState> = {}
): CommerceAppState {
  return {
    configuration: getConfigurationInitialState(),
    productListing: getProductListingInitialState(),
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
    commerceParameters: getCommerceParametersInitialState(),
    recentQueries: getRecentQueriesInitialState(),
    querySuggest: getQuerySuggestSetInitialState(),
    querySet: getQuerySetInitialState(),
    cart: getCartInitialState(),
    didYouMean: getDidYouMeanInitialState(),
    instantProducts: getInstantProductsInitialState(),
    commerceStandaloneSearchBoxSet:
      getCommerceStandaloneSearchBoxSetInitialState(),
    triggers: getTriggerInitialState(),
    fieldSuggestionsOrder: getFieldSuggestionsOrderInitialState(),
    manualNumericFacetSet: getManualNumericFacetInitialState(),
    productEnrichment: getProductEnrichmentInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
