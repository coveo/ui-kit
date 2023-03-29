export type {Unsubscribe, Middleware} from '@reduxjs/toolkit';

export type {
  ProductListingEngine,
  ProductListingEngineConfiguration,
  ProductListingEngineOptions,
} from './app/product-listing-engine/product-listing-engine';
export {
  buildProductListingEngine,
  getSampleProductListingEngineConfiguration,
} from './app/product-listing-engine/product-listing-engine';

export type {CoreEngine, ExternalEngineOptions} from './app/engine';
export type {
  EngineConfiguration,
  AnalyticsConfiguration,
  AnalyticsRuntimeEnvironment,
} from './app/engine-configuration';
export type {LoggerOptions} from './app/logger';
export type {LogLevel} from './app/logger';

export type {ProductRecommendation} from './api/search/search/product-recommendation';

// Actions
export * from './features/configuration/configuration-actions-loader';
export * from './features/product-listing/product-listing-actions-loader';

// Controllers
export type {
  Controller,
  Subscribable,
} from './controllers/controller/headless-controller';
export {buildController} from './controllers/controller/headless-controller';

export type {
  ProductListingState,
  ProductListing,
  ProductListingOptions,
  ProductListingProps,
  ProductListingControllerState,
} from './controllers/product-listing/headless-product-listing';
export {buildProductListing} from './controllers/product-listing/headless-product-listing';
// ACTION: PRODUCT-LISTING
// REDUCER: CONFIGURATION

export type {
  PagerInitialState,
  PagerOptions,
  PagerProps,
  PagerState,
  Pager,
} from './controllers/product-listing/pager/headless-product-listing-pager';
export {buildPager} from './controllers/product-listing/pager/headless-product-listing-pager';
// ACTION: PRODUCT-LISTING
// ACTION: PAGINATION
// REDUCER: CONFIGURATION
// REDUCER: PAGINATION

export type {
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
  ResultsPerPage,
} from './controllers/product-listing/results-per-page/headless-product-listing-results-per-page';
export {buildResultsPerPage} from './controllers/product-listing/results-per-page/headless-product-listing-results-per-page';
// ACTION: PRODUCT-LISTING
// ACTION: PAGINATION
// ACTION: PAGINATION-ANALYTICS
// REDUCER: CONFIGURATION
// REDUCER: PAGINATION

export type {
  ProductListingSortInitialState,
  ProductListingSortProps,
  ProductListingSort,
  ProductListingSortState,
  SortByFields,
  SortByFieldsFields,
  SortByRelevance,
  SortCriterion,
} from './controllers/product-listing/sort/headless-product-listing-sort';
export {
  SortBy,
  SortDirection,
  buildSort,
  buildFieldsSortCriterion,
  buildRelevanceSortCriterion,
} from './controllers/product-listing/sort/headless-product-listing-sort';
// ACTION: PAGINATION
// ACTION: PRODUCT-LISTING
// ACTION: SORT
// REDUCER: CONFIGURATION
// REDUCER: SORT

export type {
  FacetManager,
  FacetManagerPayload,
  FacetManagerState,
} from './controllers/product-listing/facet/headless-product-listing-facet-manager';
export {buildFacetManager} from './controllers/product-listing/facet/headless-product-listing-facet-manager';
// REDUCER: PRODUCT-LISTING
// REDUCER: FACET-OPTIONS

export type {
  CoreFacet,
  CoreFacetState,
  Facet,
  FacetOptions,
  FacetProps,
  FacetSearch,
  FacetSearchOptions,
  FacetSearchState,
  FacetState,
  FacetValue,
  FacetValueState,
  SpecificFacetSearchResult,
} from './controllers/product-listing/facet/headless-product-listing-facet';
export {buildFacet} from './controllers/product-listing/facet/headless-product-listing-facet';
// ACTION: PRODUCT-LISTING
// ACTION: FACET-OPTION
// ACTION: FACET-SET-CONTROLLER
// ACTION: FACET-SET
// ACTION: GENERIC-FACET-SEARCH
// ACTION: SPECIFIC-FACET-SEARCH
// ACTION: FACET-SET-ANALYTICS
// REDUCER: CONFIGURATION
// REDUCER: FACET-OPTION
// REDUCER: FACET-SET
// REDUCER: FACET-SEARCH-SET

export type {
  CategoryFacet,
  CategoryFacetOptions,
  CategoryFacetProps,
  CategoryFacetSearch,
  CategoryFacetSearchOptions,
  CategoryFacetSearchState,
  CategoryFacetState,
  CategoryFacetValue,
  CategoryFacetSearchResult,
  CoreCategoryFacet,
  CoreCategoryFacetState,
} from './controllers/product-listing/category-facet/headless-product-listing-category-facet';
export {buildCategoryFacet} from './controllers/product-listing/category-facet/headless-product-listing-category-facet';
// ACTION: PRODUCT-LISTING
// ACTION: FACET-OPTIONS
// ACTION: GENERIC-FACET-SEARCH
// ACTION: SPECIFIC-FACET-SEARCH
// ACTION: CATEGORY-FACET-SEARCH
// ACTION: FACET-SET-ANALYTICS
// REDUCER: CONFIGURATION
// REDUCER: PRODUCT-LISTING
// REDUCER: CATEGORY-FACET-SET
// REDUCER: CATEGORY-FACET-SEARCH-SET

export type {
  DateFacet,
  DateFacetOptions,
  DateFacetProps,
  DateFacetState,
  DateFacetValue,
  DateRangeInput,
  DateRangeOptions,
  DateRangeRequest,
} from './controllers/product-listing/range-facet/date-facet/headless-product-listing-date-facet';
export {
  buildDateFacet,
  buildDateRange,
} from './controllers/product-listing/range-facet/date-facet/headless-product-listing-date-facet';
// ACTION: PRODUCT-LISTING
// ACTION: FACET-OPTIONS
// ACTION: FACET-SET
// ACTION: RANGE-FACET-SET
// ACTION: DATE-FACET-CONTROLLER
// ACTION: DATE-FACET
// ACTION: FACET-SET-ANALYTICS
// REDUCER: CONFIGURATION
// REDUCER: SEARCH
// REDUCER: FACET-OPTIONS
// REDUCER: DATE-FACET-SET

export type {
  DateFilter,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
  DateFilterInitialState,
} from './controllers/product-listing/range-facet/date-facet/headless-product-listing-date-filter';
export {buildDateFilter} from './controllers/product-listing/range-facet/date-facet/headless-product-listing-date-filter';
// ACTION: PRODUCT-LISTING
// ACTION: FACET-OPTIONS
// ACTION: DATE-FACET
// ACTION: FACET-SET-ANALYTICS
// REDUCER: CONFIGURATION
// REDUCER: SEARCH
// REDUCER: FACET-OPTIONS
// REDUCER: DATE-FACET-SET

export type {
  NumericFacet,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericFacetValue,
  NumericRangeOptions,
  NumericRangeRequest,
} from './controllers/product-listing/range-facet/numeric-facet/headless-product-listing-numeric-facet';
export {
  buildNumericFacet,
  buildNumericRange,
} from './controllers/product-listing/range-facet/numeric-facet/headless-product-listing-numeric-facet';
// ACTION: PRODUCT-LISTING
// ACTION: FACET-OPTIONS
// ACTION: FACET-SET
// ACTION: RANGE-FACET
// ACTION: NUMERIC-FACET-CONTROLLER
// ACTION: NUMERIC-FACET
// ACTION: FACET-SET-ANALYTICS
// REDUCER: CONFIGURATION
// REDUCER: SEARCH
// REDUCER: FACET-OPTIONS
// REDUCER: NUMERIC-FACET-SET

export type {
  NumericFilter,
  NumericFilterOptions,
  NumericFilterProps,
  NumericFilterRange,
  NumericFilterState,
  NumericFilterInitialState,
} from './controllers/product-listing/range-facet/numeric-facet/headless-product-listing-numeric-filter';
export {buildNumericFilter} from './controllers/product-listing/range-facet/numeric-facet/headless-product-listing-numeric-filter';
// ACTION: PRODUCT-LISTING
// ACTION: FACET-OPTIONS
// ACTION: NUMERIC-FACET
// ACTION: FACET-SET-ANALYTICS
// REDUCER: CONFIGURATION
// REDUCER: SEARCH
// REDUCER: FACET-OPTIONS
// REDUCER: NUMERIC-FACET-SET

export type {
  Context,
  ContextState,
  ContextPayload,
  ContextValue,
} from './controllers/product-listing/context/headless-product-listing-context';
export {buildContext} from './controllers/product-listing/context/headless-product-listing-context';
// ACTION: CONTEXT
// REDUCER: CONTEXT

export type {
  InteractiveResultOptions,
  InteractiveResultProps,
  InteractiveResult,
} from './controllers/product-listing/result-list/headless-product-listing-interactive-result';
export {buildInteractiveResult} from './controllers/product-listing/result-list/headless-product-listing-interactive-result';
// REDUCER: CONFIGURATION
