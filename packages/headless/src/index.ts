// 3rd Party Libraries
export {
  Unsubscribe,
  createAction,
  createAsyncThunk,
  createReducer,
  Middleware,
} from '@reduxjs/toolkit';

// Main App
export {
  SearchEngine,
  SearchEngineOptions,
  SearchEngineConfiguration,
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from './app/search-engine/search-engine';

export {LogLevel} from './app/logger';

// State
export {ProductRecommendationsAppState} from './state/product-recommendations-app-state';
export {SearchParametersState, SearchAppState} from './state/search-app-state';
export {RecommendationAppState} from './state/recommendation-app-state';

// Controllers
export * from './controllers/index';

// Selectors
export {
  baseFacetResponseSelector,
  facetRequestSelector,
  facetResponseSelector,
  facetResponseSelectedValuesSelector,
} from './features/facets/facet-set/facet-set-selectors';

export {
  currentPageSelector,
  maxPageSelector,
  currentPagesSelector,
} from './features/pagination/pagination-selectors';

// Grouped Actions
export * from './features/index';

// Analytics Actions
export * from './features/analytics/index';

// Types & Helpers
export {Result} from './api/search/search/result';
export {Raw} from './api/search/search/raw';
export {
  SortCriterion,
  buildDateSortCriterion,
  buildCriterionExpression,
  buildFieldSortCriterion,
  buildNoSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildRelevanceSortCriterion,
  SortBy,
  SortByDate,
  SortByField,
  SortByNoSort,
  SortByQRE,
  SortByRelevancy,
  SortOrder,
} from './features/sort-criteria/criteria';
export {parseCriterionExpression} from './features/sort-criteria/criteria-parser';
export {ResultTemplatesManager} from './features/result-templates/result-templates-manager';
export {
  ResultTemplate,
  ResultTemplateCondition,
} from './features/result-templates/result-templates';
export * as TestUtils from './test';
export {platformUrl} from './api/platform-client';
export {CategoryFacetSortCriterion} from './features/facets/category-facet-set/interfaces/request';
export {CategoryFacetValue} from './features/facets/category-facet-set/interfaces/response';
export {DateFacetValue} from './features/facets/range-facets/date-facet-set/interfaces/response';
export {FacetSortCriterion} from './features/facets/facet-set/interfaces/request';
export {NumericFacetValue} from './features/facets/range-facets/numeric-facet-set/interfaces/response';
export {
  RangeFacetSortCriterion,
  RangeFacetRangeAlgorithm,
} from './features/facets/range-facets/generic/interfaces/request';
export {buildSearchParameterSerializer} from './features/search-parameters/search-parameter-serializer';
export * as HighlightUtils from './utils/highlight';
export {HighlightKeyword} from './utils/highlight';
export {VERSION} from './utils/version';
