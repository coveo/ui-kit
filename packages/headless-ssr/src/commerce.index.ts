/**
 * The Coveo Headless SSR Commerce sub-package exposes the engine definer, controller definers, actions, and utility functions to build a server-side rendered commerce experience.
 *
 * @example
 * ```typescript
 * import {
 *   defineCommerceEngine,
 *   definePagination,
 *   defineProductList,
 *   defineRecommendations,
 *   getSampleCommerceEngineConfiguration,
 *   type InferHydratedState,
 *   type InferStaticState,
 * } from '@coveo/headless-ssr/commerce';
 *
 * // Shared by the server and the browser. The context, the cart and the navigator context
 * // are per-request data: they are passed to `fetchStaticState()`, not to the configuration.
 * export const {
 *   listingEngineDefinition,
 *   searchEngineDefinition,
 *   standaloneEngineDefinition,
 *   recommendationEngineDefinition,
 * } = defineCommerceEngine({
 *   configuration: getSampleCommerceEngineConfiguration(),
 *   controllers: {
 *     productList: defineProductList(),
 *     pagination: definePagination(),
 *     popularViewed: defineRecommendations({options: {slotId: '...'}}),
 *   },
 * });
 *
 * export type ListingStaticState = InferStaticState<typeof listingEngineDefinition>;
 * export type ListingHydratedState = InferHydratedState<typeof listingEngineDefinition>;
 *
 * // On the server, once per request
 * const staticState = await listingEngineDefinition.fetchStaticState({
 *   navigatorContext: {
 *     clientId: '...',
 *     location: 'https://example.com/browse/toys',
 *     referrer: null,
 *     userAgent: '...',
 *     forwardedFor: '...',
 *   },
 *   context: {
 *     language: 'en',
 *     country: 'US',
 *     currency: 'USD',
 *     view: {url: 'https://example.com/browse/toys'},
 *   },
 *   cart: {items: []},
 * });
 *
 * // In the browser, from the serialized static state, passed as is: it already carries the
 * // navigator context, the context, the cart, the search parameters and the access token.
 * const {engine, controllers} = await listingEngineDefinition.hydrateStaticState(staticState);
 * ```
 * @module SSR Commerce
 */

export type {Relay} from '@coveo/relay';

export type {Middleware, Unsubscribe} from '@reduxjs/toolkit';
export type {CommerceEngineConfiguration} from '@coveo/headless/commerce';
export {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
export type {CoreEngineNext, ExternalEngineOptions} from '@coveo/headless/commerce';
// export type
export type {
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
  EngineConfiguration,
} from '@coveo/headless/commerce';
export type {LoggerOptions, LogLevel} from '@coveo/headless/commerce';
export type {
  BrowserNavigatorContextProvider,
  NavigatorContextProvider,
} from '@coveo/headless/ssr-internal';
export type {NavigatorContext} from '@coveo/headless/commerce';
export type {
  InteractiveProduct,
  InteractiveProductOptions,
  InteractiveProductProps,
} from '@coveo/headless/commerce';
//#region Controllers
export type {Controller, Subscribable} from '@coveo/headless/commerce';
export type {
  BreadcrumbManager,
  BreadcrumbManagerDefinition,
  BreadcrumbManagerState,
} from './commerce/controllers/breadcrumb-manager/headless-core-breadcrumb-manager.ssr.js';
export {defineBreadcrumbManager} from './commerce/controllers/breadcrumb-manager/headless-core-breadcrumb-manager.ssr.js';
export type {
  Cart,
  CartBuildProps,
  CartDefinition,
  CartInitialState,
  CartItem,
  CartProps,
  CartState,
} from './commerce/controllers/cart/headless-cart.ssr.js';
export {defineCart} from './commerce/controllers/cart/headless-cart.ssr.js';
export type {
  Context,
  ContextDefinition,
  ContextOptions,
  ContextProps,
  ContextState,
  CustomContext,
  UserLocation,
  View,
} from './commerce/controllers/context/headless-context.ssr.js';
export {defineContext} from './commerce/controllers/context/headless-context.ssr.js';
export type {
  DidYouMean,
  DidYouMeanDefinition,
  DidYouMeanOptions,
  DidYouMeanState,
} from './commerce/controllers/did-you-mean/headless-did-you-mean.ssr.js';
export {defineDidYouMean} from './commerce/controllers/did-you-mean/headless-did-you-mean.ssr.js';
export type {
  CategoryFilterSuggestions,
  CategoryFilterSuggestionsState,
  FieldSuggestionsFacet,
  FilterSuggestions,
  FilterSuggestionsGenerator,
  FilterSuggestionsGeneratorDefinition,
  FilterSuggestionsState,
  GeneratedFilterSuggestionsControllers,
} from './commerce/controllers/filter-suggestions/headless-filter-suggestions-generator.ssr.js';
export {defineFilterSuggestionsGenerator} from './commerce/controllers/filter-suggestions/headless-filter-suggestions-generator.ssr.js';
export type {
  BaseFacetSearchResult,
  CategoryFacet,
  CategoryFacetSearchResult,
  CategoryFacetState,
  CategoryFacetValue,
  CoreCommerceFacet,
  DateFacet,
  DateFacetState,
  DateFacetValue,
  FacetGenerator,
  FacetGeneratorDefinition,
  FacetGeneratorState,
  FacetType,
  MappedFacetState,
  MappedFacetStates,
  MappedGeneratedFacetController,
  NumericFacet,
  NumericFacetState,
  NumericFacetValue,
  RegularFacet,
  RegularFacetState,
  RegularFacetValue,
} from './commerce/controllers/generator/headless-commerce-facet-generator.ssr.js';
export {defineFacetGenerator} from './commerce/controllers/generator/headless-commerce-facet-generator.ssr.js';
export type {
  InstantProducts,
  InstantProductsDefinition,
  InstantProductsOptions,
  InstantProductsProps,
  InstantProductsState,
} from './commerce/controllers/instant-products/headless-instant-products.ssr.js';
export {defineInstantProducts} from './commerce/controllers/instant-products/headless-instant-products.ssr.js';
export type {
  CorePaginationOptions,
  Pagination,
  PaginationDefinition,
  PaginationOptions,
  PaginationProps,
  PaginationState,
} from './commerce/controllers/pagination/headless-core-commerce-pagination.ssr.js';
export {definePagination} from './commerce/controllers/pagination/headless-core-commerce-pagination.ssr.js';
export type {
  CommerceSearchParameters,
  ParameterManager,
  ParameterManagerDefinition,
  ParameterManagerProps,
  ParameterManagerState,
  Parameters,
  ProductListingParameters,
  SSRParameterManagerProps,
} from './commerce/controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
export {defineParameterManager} from './commerce/controllers/parameter-manager/headless-core-parameter-manager.ssr.js';
export type {
  ProductEnrichment,
  ProductEnrichmentDefinition,
  ProductEnrichmentProps,
  ProductEnrichmentState,
} from './commerce/controllers/product-enrichment/headless-product-enrichment.ssr.js';
export {defineProductEnrichment} from './commerce/controllers/product-enrichment/headless-product-enrichment.ssr.js';
export type {
  ProductList,
  ProductListDefinition,
  ProductListing,
  ProductListOptions,
  ProductListState,
  Search,
} from './commerce/controllers/product-list/headless-product-list.ssr.js';
export {defineProductList} from './commerce/controllers/product-list/headless-product-list.ssr.js';
export type {
  ProductView,
  ProductViewDefinition,
} from './commerce/controllers/product-view/headless-product-view.ssr.js';
export {defineProductView} from './commerce/controllers/product-view/headless-product-view.ssr.js';
export type {
  RecentQueriesList,
  RecentQueriesListDefinition,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesState,
} from './commerce/controllers/recent-queries-list/headless-recent-queries-list.ssr.js';
export {defineRecentQueriesList} from './commerce/controllers/recent-queries-list/headless-recent-queries-list.ssr.js';
export type {
  Recommendations,
  RecommendationsDefinition,
  RecommendationsState,
} from './commerce/controllers/recommendations/headless-recommendations.ssr.js';
export {defineRecommendations} from './commerce/controllers/recommendations/headless-recommendations.ssr.js';
export type {
  CoreSearchBox,
  SearchBox,
  SearchBoxDefinition,
  SearchBoxOptions,
  SearchBoxProps,
  SearchBoxState,
  Suggestion,
} from './commerce/controllers/search-box/headless-search-box.ssr.js';
export {defineSearchBox} from './commerce/controllers/search-box/headless-search-box.ssr.js';
export type {
  Sort,
  SortDefinition,
  SortProps,
  SortState,
} from './commerce/controllers/sort/headless-core-commerce-sort.ssr.js';
export {defineSort} from './commerce/controllers/sort/headless-core-commerce-sort.ssr.js';
export type {
  StandaloneSearchBox,
  StandaloneSearchBoxDefinition,
  StandaloneSearchBoxProps,
  StandaloneSearchBoxState,
} from './commerce/controllers/standalone-search-box/headless-standalone-search-box.ssr.js';
export {defineStandaloneSearchBox} from './commerce/controllers/standalone-search-box/headless-standalone-search-box.ssr.js';
export type {
  ProductListingSummaryState,
  RecommendationsSummaryState,
  SearchSummaryState,
  Summary,
  SummaryDefinition,
  SummaryState,
} from './commerce/controllers/summary/headless-core-summary.ssr.js';
export {defineSummary} from './commerce/controllers/summary/headless-core-summary.ssr.js';
export type {
  NotifyTrigger,
  NotifyTriggerDefinition,
  NotifyTriggerState,
} from './commerce/controllers/triggers/headless-notify-trigger.ssr.js';
export {defineNotifyTrigger} from './commerce/controllers/triggers/headless-notify-trigger.ssr.js';
export type {
  QueryTrigger,
  QueryTriggerDefinition,
  QueryTriggerState,
} from './commerce/controllers/triggers/headless-query-trigger.ssr.js';
export {defineQueryTrigger} from './commerce/controllers/triggers/headless-query-trigger.ssr.js';
export type {
  RedirectionTrigger,
  RedirectionTriggerDefinition,
  RedirectionTriggerState,
} from './commerce/controllers/triggers/headless-redirection-trigger.ssr.js';
export {defineRedirectionTrigger} from './commerce/controllers/triggers/headless-redirection-trigger.ssr.js';
export {
  MissingControllerProps,
  MultipleRecommendationError,
  SolutionTypeMismatchError,
} from './common/errors.js';
export type {BuildNavigatorContextOptions, RequestHeaders} from './common/navigator-context.js';
export {buildNavigatorContext} from './common/navigator-context.js';
export {defineCommerceEngine} from './commerce/engine/commerce-engine.ssr.js';
export type {SSRCommerceEngine as CommerceEngine} from './commerce/factories/build-factory.js';
// Main App
export type {
  BuildConfig,
  SSRCommerceEngineOptions as CommerceEngineOptions,
} from './commerce/types/build.js';
export {SolutionType} from './commerce/types/controller-constants.js';
export type {
  AugmentedControllerDefinition,
  CommerceEngineDefinitionControllersPropsOption as EngineDefinitionControllersPropsOption,
  ControllerDefinition,
  ControllerDefinitionsMap,
  InferControllerStaticStateFromController,
  InferControllerStaticStateMapFromControllers,
} from './commerce/types/controller-definitions.js';
export type {
  InferControllerFromDefinition,
  InferControllerPropsMapFromDefinitions,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
  InferHydratedState,
  InferStaticState,
} from './commerce/types/controller-inference.js';
export type {
  CommerceEngineDefinition,
  CommerceEngineDefinitionOptions,
} from './commerce/types/engine.js';
export type {CommerceStaticState} from './commerce/types/fetch-static-state.js';
export type {CommerceHydratedState} from './commerce/types/hydrate-static-state.js';
export type {ControllerStaticState} from './common/types/controllers.js';
export type {EngineDefinition, EngineStaticState} from './common/types/engine.js';
// State
export type {
  CommerceAppState,
  CommerceProductListingParametersState,
  CommerceSearchParametersState,
} from '@coveo/headless/ssr-internal';

// TODO: KIT-3391 - export other SSR commerce controllers

//#endregion

export {
  loadConfigurationActions,
  type UpdateAnalyticsConfigurationPayload,
  type UpdateBasicConfigurationPayload,
  type ConfigurationActionCreators,
} from '@coveo/headless/commerce';
export {
  loadCartActions,
  type CartActionPayload,
  type PurchasePayload,
  type SetItemsPayload,
  type UpdateItemQuantityPayload,
  type CartActionCreators,
} from '@coveo/headless/commerce';
//#region Grouped actions
export {
  loadContextActions,
  type SetContextPayload,
  type SetCustomPayload,
  type SetLocationPayload,
  type SetViewPayload,
  type ContextActionCreators,
} from '@coveo/headless/commerce';
export {
  loadCategoryFacetSetActions,
  type ToggleSelectCategoryFacetValuePayload,
  type UpdateCategoryFacetNumberOfValuesPayload,
  type CategoryFacetSetActionCreators,
} from '@coveo/headless/commerce';
export {
  loadCoreFacetActions,
  type DeselectAllValuesInCoreFacetPayload,
  type UpdateAutoSelectionForAllCoreFacetsPayload,
  type UpdateCoreFacetFreezeCurrentValuesPayload,
  type UpdateCoreFacetIsFieldExpandedPayload,
  type UpdateCoreFacetNumberOfValuesPayload,
  type CoreFacetActionsCreators,
} from '@coveo/headless/commerce';
export {
  loadDateFacetActions,
  type ToggleExcludeDateFacetValuePayload,
  type ToggleSelectDateFacetValuePayload,
  type UpdateDateFacetValuesPayload,
  type DateFacetActionCreators,
} from '@coveo/headless/commerce';
export {
  loadNumericFacetActions,
  type ToggleExcludeNumericFacetValuePayload,
  type ToggleSelectNumericFacetValuePayload,
  type UpdateNumericFacetValuesPayload,
  type NumericFacetActionCreators,
} from '@coveo/headless/commerce';
export type {LocationFacet, LocationFacetState, LocationFacetValue} from '@coveo/headless/commerce';
export {
  loadRegularFacetActions,
  type ToggleExcludeFacetValuePayload,
  type ToggleSelectFacetValuePayload,
  type RegularFacetActionCreators,
} from '@coveo/headless/commerce';
export {
  loadInstantProductsActions,
  type ClearExpiredInstantProductsPayload,
  type CoreInstantProductPayload,
  type PromoteChildToParentPayload,
  type RegisterInstantProductPayload,
  type UpdateInstantProductQueryPayload,
  type InstantProductsActionCreators,
} from '@coveo/headless/commerce';
export {
  loadPaginationActions,
  type NextPagePayload,
  type PreviousPagePayload,
  type RegisterRecommendationsSlotPaginationPayload,
  type SelectPagePayload,
  type SetPageSizePayload,
  type PaginationActionCreators,
} from '@coveo/headless/commerce';
export {
  loadProductActions,
  type ProductClickPayload,
  type ProductViewPayload,
  type ProductActionCreators,
} from '@coveo/headless/commerce';
export {
  loadProductEnrichmentActions,
  type FetchBadgesPayload,
  type RegisterProductEnrichmentOptionsPayload,
  type ProductEnrichmentActionCreators,
} from '@coveo/headless/commerce';
export {
  loadProductListingActions,
  type ProductListingActionCreators,
} from '@coveo/headless/commerce';
export {
  loadProductListingParametersActions,
  type RestoreProductListingParametersPayload,
  type ProductListingParametersActionCreators,
} from '@coveo/headless/commerce';
export {
  loadQueryActions,
  type UpdateQueryPayload,
  type QueryActionCreators,
} from '@coveo/headless/commerce';
export {
  loadQuerySetActions,
  type RegisterQuerySetQueryPayload,
  type UpdateQuerySetQueryPayload,
  type QuerySetActionCreators,
} from '@coveo/headless/commerce';
export {
  loadQuerySuggestActions,
  type ClearQuerySuggestPayload,
  type FetchQuerySuggestionsPayload,
  type RegisterQuerySuggestPayload,
  type SelectQuerySuggestionPayload,
  type QuerySuggestActionCreators,
} from '@coveo/headless/commerce';
export {
  loadRecentQueriesActions,
  type RegisterRecentQueriesCreatorPayload,
  type RecentQueriesActionCreators,
} from '@coveo/headless/commerce';
export {
  loadRecommendationsActions,
  type FetchMoreRecommendationsPayload,
  type FetchRecommendationsPayload,
  type RegisterRecommendationsSlotPayload,
  type RecommendationsActionCreator,
} from '@coveo/headless/commerce';
export {
  loadSearchActions,
  type FetchSearchPayload,
  type PrepareForSearchWithQueryPayload,
  type SearchActionCreators,
} from '@coveo/headless/commerce';
export {
  loadSearchParametersActions,
  type RestoreSearchParametersPayload,
  type SearchParametersActionCreators,
} from '@coveo/headless/commerce';
export {
  loadSortActions,
  type ApplySortPayload,
  type SortActionCreators,
} from '@coveo/headless/commerce';
export {
  loadStandaloneSearchBoxSetActions,
  type FetchRedirectUrlPayload,
  type RegisterStandaloneSearchBoxPayload,
  type ResetStandaloneSearchBoxPayload,
  type StandaloneSearchBoxSetActionCreators,
} from '@coveo/headless/commerce';
export {
  loadTriggersActions,
  type ApplyQueryTriggerModificationPayload,
  type UpdateIgnoreQueryTriggerPayload,
  type updateIgnoreQueryTrigger,
  type TriggersActionCreators,
} from '@coveo/headless/commerce';
export {buildResultTemplatesManager} from '@coveo/headless';

//#endregion

export {getCommerceApiBaseUrl} from '@coveo/headless/commerce';
// Types & Helpers
// TODO KIT-3462: add export commerce SSR parameter serializer
export type {BaseProduct, ChildProduct, Product} from '@coveo/headless/commerce';
export type {Result, SpotlightContent} from '@coveo/headless/commerce';
export {ResultType} from '@coveo/headless/commerce';
export {getAnalyticsNextApiBaseUrl, getOrganizationEndpoint} from '@coveo/headless/commerce';
export type {RelativeDate, RelativeDatePeriod, RelativeDateUnit} from '@coveo/headless';
export {deserializeRelativeDate, validateRelativeDate} from '@coveo/headless/commerce';
export {buildParameterSerializer} from '@coveo/headless/ssr-internal';
export {ProductTemplatesHelpers} from '@coveo/headless/commerce';
export type {
  ProductTemplate,
  ProductTemplateCondition,
  ProductTemplatesManager,
} from '@coveo/headless/commerce';
export type {SortCriterion} from '@coveo/headless/commerce';
export {SortBy} from '@coveo/headless/commerce';
export type {
  SortByDate,
  SortByField,
  SortByNoSort,
  SortByQRE,
  SortByRelevancy,
} from '@coveo/headless';
export {
  buildCriterionExpression,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
  SortOrder,
} from '@coveo/headless';
export {parseCriterionExpression} from '@coveo/headless';
export type {Template} from '@coveo/headless/commerce';
export type {HighlightKeyword} from '@coveo/headless/commerce';
export {
  buildQueryExpression,
  type DateFieldExpression,
  type DateRangeFieldExpression,
  type ExactMatchExpression,
  type FieldExistsExpression,
  type KeywordExpression,
  type NearExpression,
  type Negatable,
  type NumericFieldExpression,
  type NumericRangeFieldExpression,
  type OtherTerm,
  type QueryExtensionExpression,
  type StringFacetFieldExpression,
  type StringFieldExpression,
  type QueryExpression,
} from '@coveo/headless';
export type {PlatformEnvironment} from '@coveo/headless/commerce';
export {VERSION} from '@coveo/headless/commerce';
