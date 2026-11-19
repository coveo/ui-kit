/**
 * Internal entry point for `@coveo/headless-ssr`. Not public API: no semver guarantee, may change in any release.
 * This entry is ESM only, so it shares module instances with the public entries. Still, only pure functions,
 * slice reducers, selectors, schemas and types belong here. Never add thunks, RTK Query APIs, classes checked
 * with `instanceof`, or `Symbol()` keys: a CJS build of this entry would be a separate bundle with its own copies.
 * @internal
 * @module SSR internals
 */
export type {
  PlatformClientOrigin,
  PlatformRequestOptions,
  PreprocessRequest,
  RequestMetadata,
} from './api/preprocess-request.js';
export type {BaseFacetSearchResult} from './api/search/facet-search/base/base-facet-search-response.js';
export {buildLogger} from './app/logger.js';
export type {
  BrowserNavigatorContextProvider,
  NavigatorContextProvider,
} from './app/navigator-context-provider.js';
export {stateKey} from './app/state-key.js';
export {getCategoryFacetState} from './controllers/commerce/core/facets/category/headless-commerce-category-facet.js';
export {getDateFacetState} from './controllers/commerce/core/facets/date/headless-commerce-date-facet.js';
export {getCoreFacetState} from './controllers/commerce/core/facets/headless-core-commerce-facet.js';
export type {CoreCommerceFacet} from './controllers/commerce/core/facets/headless-core-commerce-facet.js';
export {getNumericFacetState} from './controllers/commerce/core/facets/numeric/headless-commerce-numeric-facet.js';
export {getRegularFacetState} from './controllers/commerce/core/facets/regular/headless-commerce-regular-facet.js';
export type {CorePaginationOptions} from './controllers/commerce/core/pagination/headless-core-commerce-pagination.js';
export type {SummaryState} from './controllers/commerce/core/summary/headless-core-summary.js';
export {
  facetResponseSelector as productListingFacetResponseSelector,
  isFacetLoadingResponseSelector as productListingIsFacetLoadingResponseSelector,
} from './controllers/commerce/product-listing/facets/headless-product-listing-facet-options.js';
export {
  facetResponseSelector as commerceSearchFacetResponseSelector,
  isFacetLoadingResponseSelector as commerceSearchIsFacetLoadingResponseSelector,
} from './controllers/commerce/search/facets/headless-search-facet-options.js';
export type {SearchBox} from './controllers/core/search-box/headless-core-search-box.js';
export {advancedSearchQueriesReducer} from './features/advanced-search-queries/advanced-search-queries-slice.js';
export type {LegacySearchAction} from './features/analytics/analytics-utils.js';
export {contextDefinition} from './features/commerce/context/context-validation.js';
export {commerceFacetOrderReducer} from './features/commerce/facets/facet-order/commerce-facet-order-slice.js';
export {facetRequestSelector} from './features/commerce/facets/facet-set/facet-set-selector.js';
export {commerceFacetSetReducer} from './features/commerce/facets/facet-set/facet-set-slice.js';
export type {CategoryFacetRequest} from './features/commerce/facets/facet-set/interfaces/request.js';
export type {AnyFacetResponse} from './features/commerce/facets/facet-set/interfaces/response.js';
export {manualNumericFacetSelector} from './features/commerce/facets/numeric-facet/manual-numeric-facet-selectors.js';
export {manualNumericFacetReducer} from './features/commerce/facets/numeric-facet/manual-numeric-facet-slice.js';
export {paginationReducer as commercePaginationReducer} from './features/commerce/pagination/pagination-slice.js';
export {parametersDefinition} from './features/commerce/parameters/parameters-schema.js';
export {buildParameterSerializer} from './features/commerce/parameters/parameters-serializer.ssr.js';
export {parametersReducer} from './features/commerce/parameters/parameters-slice.js';
export type {ProductListingParameters} from './features/commerce/product-listing-parameters/product-listing-parameters-actions.js';
export {commerceQuerySetReducer} from './features/commerce/query-set/commerce-query-set-slice.js';
export {queryReducer as commerceQueryReducer} from './features/commerce/query/query-slice.js';
export {sortReducer} from './features/commerce/sort/sort-slice.js';
export {configurationReducer} from './features/configuration/configuration-slice.js';
export {debugReducer} from './features/debug/debug-slice.js';
export {facetOptionsReducer} from './features/facet-options/facet-options-slice.js';
export {automaticFacetSetReducer} from './features/facets/automatic-facet-set/automatic-facet-set-slice.js';
export {categoryFacetSetReducer} from './features/facets/category-facet-set/category-facet-set-slice.js';
export {categoryFacetSearchStateSelector} from './features/facets/facet-search-set/category/category-facet-search-state-selector.js';
export {specificFacetSearchStateSelector} from './features/facets/facet-search-set/specific/specific-facet-search-state-selector.js';
export {facetSetReducer} from './features/facets/facet-set/facet-set-slice.js';
export {dateFacetSetReducer} from './features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
export {numericFacetSetReducer} from './features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
export {paginationReducer} from './features/pagination/pagination-slice.js';
export {queryReducer} from './features/query/query-slice.js';
export {buildSSRSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer.ssr.js';
export {sortCriteriaReducer} from './features/sort-criteria/sort-criteria-slice.js';
export {staticFilterSetReducer} from './features/static-filter-set/static-filter-set-slice.js';
export {tabSetReducer} from './features/tab-set/tab-set-slice.js';
export type {
  CommerceAppState,
  CommerceProductListingParametersState,
  CommerceSearchParametersState,
} from './state/commerce-app-state.js';
export type {ManualRangeSection} from './state/state-sections.js';
export {loadReducerError} from './utils/errors.js';
export {isBrowser} from './utils/runtime.js';
export {
  clone,
  createWaitForActionMiddleware,
  createWaitForActionMiddlewareForRecommendation,
  filterObject,
  mapObject,
} from './utils/utils.js';
export {nonEmptyString, nonRequiredEmptyAllowedString} from './utils/validate-payload.js';
