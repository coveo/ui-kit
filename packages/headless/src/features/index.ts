import {updateAdvancedSearchQueries as updateAdvancedSearchQueriesAlias} from './advanced-search-queries/advanced-search-queries-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadAdvancedSearchQueryActions` instead.
 */
export namespace AdvancedSearchQueriesActions {
  export const updateAdvancedSearchQueries = updateAdvancedSearchQueriesAlias;
}

export * from './advanced-search-queries/advanced-search-queries-actions-loader';

import {
  registerCategoryFacet as registerCategoryFacetAlias,
  toggleSelectCategoryFacetValue as toggleSelectCategoryFacetValueAlias,
  deselectAllCategoryFacetValues as deselectAllCategoryFacetValuesAlias,
  updateCategoryFacetNumberOfValues as updateCategoryFacetNumberOfValuesAlias,
  updateCategoryFacetSortCriterion as updateCategoryFacetSortCriterionAlias,
} from './facets/category-facet-set/category-facet-set-actions';

/**
 * @deprecated - This namespace will be removed. Please use `loadCategoryFacetSetActions` instead.
 */
export namespace CategoryFacetSetActions {
  export const registerCategoryFacet = registerCategoryFacetAlias;
  export const toggleSelectCategoryFacetValue = toggleSelectCategoryFacetValueAlias;
  export const deselectAllCategoryFacetValues = deselectAllCategoryFacetValuesAlias;
  export const updateCategoryFacetNumberOfValues = updateCategoryFacetNumberOfValuesAlias;
  export const updateCategoryFacetSortCriterion = updateCategoryFacetSortCriterionAlias;
}

export * from './facets/category-facet-set/category-facet-set-actions-loader';

import {
  registerFacet as registerFacetAlias,
  toggleSelectFacetValue as toggleSelectFacetValueAlias,
  updateFacetIsFieldExpanded as updateFacetIsFieldExpandedAlias,
  updateFacetNumberOfValues as updateFacetNumberOfValuesAlias,
  updateFacetSortCriterion as updateFacetSortCriterionAlias,
  updateFreezeCurrentValues as updateFreezeCurrentValuesAlias,
  deselectAllFacetValues as deselectAllFacetValuesAlias,
} from './facets/facet-set/facet-set-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadFacetSetActions` instead.
 */
export namespace FacetActions {
  export const registerFacet = registerFacetAlias;
  export const toggleSelectFacetValue = toggleSelectFacetValueAlias;
  export const updateFacetIsFieldExpanded = updateFacetIsFieldExpandedAlias;
  export const updateFacetNumberOfValues = updateFacetNumberOfValuesAlias;
  export const updateFacetSortCriterion = updateFacetSortCriterionAlias;
  export const updateFreezeCurrentValues = updateFreezeCurrentValuesAlias;
  export const deselectAllFacetValues = deselectAllFacetValuesAlias;
}

export * from './facets/facet-set/facet-set-actions-loader';

import {
  updateBasicConfiguration as updateBasicConfigurationAlias,
  updateSearchConfiguration as updateSearchConfigurationAlias,
  updateAnalyticsConfiguration as updateAnalyticsConfigurationAlias,
  renewAccessToken as renewAccessTokenAlias,
  disableAnalytics as disableAnalyticsAlias,
  enableAnalytics as enableAnalyticsAlias,
  setOriginLevel2 as setOriginLevel2Alias,
  setOriginLevel3 as setOriginLevel3Alias,
} from './configuration/configuration-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadConfigurationActions` or `loadSearchConfigurationActions` instead.
 */
export namespace ConfigurationActions {
  export const updateBasicConfiguration = updateBasicConfigurationAlias;
  export const updateSearchConfiguration = updateSearchConfigurationAlias;
  export const updateAnalyticsConfiguration = updateAnalyticsConfigurationAlias;
  export const renewAccessToken = renewAccessTokenAlias;
  export const disableAnalytics = disableAnalyticsAlias;
  export const enableAnalytics = enableAnalyticsAlias;
  export const setOriginLevel2 = setOriginLevel2Alias;
  export const setOriginLevel3 = setOriginLevel3Alias;
}

export * from './configuration/configuration-actions-loader';
export * from './configuration/search-configuration-actions-loader';

import {
  setContext as setContextAlias,
  addContext as addContextAlias,
  removeContext as removeContextAlias,
} from './context/context-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadContextActions` instead.
 */
export namespace ContextActions {
  export const setContext = setContextAlias;
  export const addContext = addContextAlias;
  export const removeContext = removeContextAlias;
}

export * from './context/context-actions-loader';

import {
  enableDebug as enableDebugAlias,
  disableDebug as disableDebugAlias,
} from './debug/debug-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadDebugActions` instead.
 */
export namespace DebugActions {
  export const enableDebug = enableDebugAlias;
  export const disableDebug = disableDebugAlias;
}

export * from './debug/debug-actions-loader';

import {
  registerDateFacet as registerDateFacetAlias,
  toggleSelectDateFacetValue as toggleSelectDateFacetValueAlias,
  updateDateFacetSortCriterion as updateDateFacetSortCriterionAlias,
  deselectAllDateFacetValues as deselectAllDateFacetValuesAlias,
} from './facets/range-facets/date-facet-set/date-facet-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadDateFacetSetActions` instead.
 */
export namespace DateFacetActions {
  export const registerDateFacet = registerDateFacetAlias;
  export const toggleSelectDateFacetValue = toggleSelectDateFacetValueAlias;
  export const updateDateFacetSortCriterion = updateDateFacetSortCriterionAlias;
  export const deselectAllDateFacetValues = deselectAllDateFacetValuesAlias;
}

export * from './facets/range-facets/date-facet-set/date-facet-actions-loader';

import {
  enableDidYouMean as enableDidYouMeanAlias,
  applyDidYouMeanCorrection as applyDidYouMeanCorrectionAlias,
  disableDidYouMean as disableDidYouMeanAlias,
} from './did-you-mean/did-you-mean-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadDidYouMeanActions` instead.
 */
export namespace DidYouMeanActions {
  export const enableDidYouMean = enableDidYouMeanAlias;
  export const applyDidYouMeanCorrection = applyDidYouMeanCorrectionAlias;
  export const disableDidYouMean = disableDidYouMeanAlias;
}

export * from './did-you-mean/did-you-mean-actions-loader';

import {registerFieldsToInclude as registerFieldsToIncludeAlias} from './fields/fields-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadFieldActions` instead.
 */
export namespace FieldActions {
  export const registerFieldsToInclude = registerFieldsToIncludeAlias;
}

export * from './fields/fields-actions-loader';

import {
  snapshot as snapshotAlias,
  back as backAlias,
  change as changeAlias,
  forward as forwardAlias,
} from './history/history-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadHistoryActions` instead.
 */
export namespace HistoryActions {
  export const snapshot = snapshotAlias;
  export const back = backAlias;
  export const change = changeAlias;
  export const forward = forwardAlias;
}

export * from './history/history-actions-loader';

import {
  registerNumericFacet as registerNumericFacetAlias,
  deselectAllNumericFacetValues as deselectAllNumericFacetValuesAlias,
  toggleSelectNumericFacetValue as toggleSelectNumericFacetValueAlias,
  updateNumericFacetSortCriterion as updateNumericFacetSortCriterionAlias,
} from './facets/range-facets/numeric-facet-set/numeric-facet-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadNumericFacetSetActions` instead.
 */
export namespace NumericFacetActions {
  export const registerNumericFacet = registerNumericFacetAlias;
  export const deselectAllNumericFacetValues = deselectAllNumericFacetValuesAlias;
  export const toggleSelectNumericFacetValue = toggleSelectNumericFacetValueAlias;
  export const updateNumericFacetSortCriterion = updateNumericFacetSortCriterionAlias;
}

export * from './facets/range-facets/numeric-facet-set/numeric-facet-actions-loader';

export {
  ResultTemplatesManager,
  buildResultTemplatesManager,
} from './result-templates/result-templates-manager';

import {
  registerNumberOfResults as registerNumberOfResultsAlias,
  registerPage as registerPageAlias,
  nextPage as nextPageAlias,
  previousPage as previousPageAlias,
  updateNumberOfResults as updateNumberOfResultsAlias,
  updatePage as updatePageAlias,
} from './pagination/pagination-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadPaginationActions` instead.
 */
export namespace PaginationActions {
  export const registerNumberOfResults = registerNumberOfResultsAlias;
  export const registerPage = registerPageAlias;
  export const nextPage = nextPageAlias;
  export const previousPage = previousPageAlias;
  export const updateNumberOfResults = updateNumberOfResultsAlias;
  export const updatePage = updatePageAlias;
}

export * from './pagination/pagination-actions-loader';

import {setPipeline as setPipelineAlias} from './pipeline/pipeline-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadPipelineActions` instead.
 */
export namespace PipelineActions {
  export const setPipeline = setPipelineAlias;
}

export * from './pipeline/pipeline-actions-loader';

import {updateQuery as updateQueryAlias} from './query/query-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadQueryActions` instead.
 */
export namespace QueryActions {
  export const updateQuery = updateQueryAlias;
}

export * from './query/query-actions-loader';

import {
  registerQuerySetQuery as registerQuerySetQueryAlias,
  updateQuerySetQuery as updateQuerySetQueryAlias,
} from './query-set/query-set-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadQuerySetActions` instead.
 */
export namespace QuerySetActions {
  export const registerQuerySetQuery = registerQuerySetQueryAlias;
  export const updateQuerySetQuery = updateQuerySetQueryAlias;
}

export * from './query-set/query-set-actions-loader';

import {
  registerQuerySuggest as registerQuerySuggestAlias,
  buildQuerySuggestRequest as buildQuerySuggestRequestAlias,
  clearQuerySuggest as clearQuerySuggestAlias,
  clearQuerySuggestCompletions as clearQuerySuggestCompletionsAlias,
  fetchQuerySuggestions as fetchQuerySuggestionsAlias,
  QuerySuggestionID as QuerySuggestionIDAlias,
  selectQuerySuggestion as selectQuerySuggestionAlias,
  StateNeededByQuerySuggest as StateNeededByQuerySuggestAlias,
  unregisterQuerySuggest as unregisterQuerySuggestAlias,
} from './query-suggest/query-suggest-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadQuerySuggestActions` instead.
 */
export namespace QuerySuggestActions {
  export const registerQuerySuggest = registerQuerySuggestAlias;
  export const buildQuerySuggestRequest = buildQuerySuggestRequestAlias;
  export const clearQuerySuggest = clearQuerySuggestAlias;
  export const clearQuerySuggestCompletions = clearQuerySuggestCompletionsAlias;
  export const fetchQuerySuggestions = fetchQuerySuggestionsAlias;
  export type QuerySuggestionID = QuerySuggestionIDAlias;
  export const selectQuerySuggestion = selectQuerySuggestionAlias;
  export type StateNeededByQuerySuggest = StateNeededByQuerySuggestAlias;
  export const unregisterQuerySuggest = unregisterQuerySuggestAlias;
}

export * from './query-suggest/query-suggest-actions-loader';

import {
  checkForRedirection as checkForRedirectionAlias,
  RedirectionState as RedirectionStateAlias,
  buildPlanRequest as buildPlanRequestAlias,
} from './redirection/redirection-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadRedirectionActions` instead.
 */
export namespace RedirectionActions {
  export const checkForRedirection = checkForRedirectionAlias;
  export type RedirectionState = RedirectionStateAlias;
  export const buildPlanRequest = buildPlanRequestAlias;
}

export * from './redirection/redirection-actions-loader';

import {
  StateNeededByExecuteSearch as StateNeededByExecuteSearchAlias,
  ExecuteSearchThunkReturn as ExecuteSearchThunkReturnAlias,
  executeSearch as executeSearchAlias,
  buildSearchRequest as buildSearchRequestAlias,
  fetchMoreResults as fetchMoreResultsAlias,
} from './search/search-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadConfigurationActions` instead.
 */
export namespace SearchActions {
  export type StateNeededByExecuteSearch = StateNeededByExecuteSearchAlias;
  export type ExecuteSearchThunkReturn = ExecuteSearchThunkReturnAlias;
  export const executeSearch = executeSearchAlias;
  export const buildSearchRequest = buildSearchRequestAlias;
  export const fetchMoreResults = fetchMoreResultsAlias;
}

export * from './search/search-actions-loader';

import {setSearchHub as setSearchHubAlias} from './search-hub/search-hub-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadSearchActions` instead.
 */
export namespace SearchHubActions {
  export const setSearchHub = setSearchHubAlias;
}

export * from './search-hub/search-hub-actions-loader';

import {
  registerSortCriterion as registerSortCriterionAlias,
  updateSortCriterion as updateSortCriterionAlias,
} from './sort-criteria/sort-criteria-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadSortCriteriaActions` instead.
 */
export namespace SortCriterionActions {
  export const registerSortCriterion = registerSortCriterionAlias;
  export const updateSortCriterion = updateSortCriterionAlias;
}

export * from './sort-criteria/sort-criteria-actions-loader';

import {
  buildRecommendationRequest as buildRecommendationRequestAlias,
  getRecommendations as getRecommendationsAlias,
  GetRecommendationsThunkReturn as GetRecommendationsThunkReturnAlias,
  setRecommendationId as setRecommendationIdAlias,
  StateNeededByGetRecommendations as StateNeededByGetRecommendationsAlias,
} from './recommendation/recommendation-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadRecommendationActions` instead.
 */
export namespace RecommendationActions {
  export const buildRecommendationRequest = buildRecommendationRequestAlias;
  export const getRecommendations = getRecommendationsAlias;
  export type GetRecommendationsThunkReturn = GetRecommendationsThunkReturnAlias;
  export const setRecommendationId = setRecommendationIdAlias;
  export type StateNeededByGetRecommendations = StateNeededByGetRecommendationsAlias;
}

export {
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/recommendation'".
   */
  RecommendationActionCreators,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/recommendation'".
   */
  SetRecommendationIdActionCreatorPayload,
  /**
   * @deprecated - The function is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/recommendation'".
   */
  loadRecommendationActions,
} from './recommendation/recommendation-actions-loader';

import {
  setProductRecommendationsBrandFilter as setProductRecommendationsBrandFilterAlias,
  buildProductRecommendationsRequest as buildProductRecommendationsRequestAlias,
  getProductRecommendations as getProductRecommendationsAlias,
  setProductRecommendationsCategoryFilter as setProductRecommendationsCategoryFilterAlias,
  GetProductRecommendationsThunkReturn as GetProductRecommendationsThunkReturnAlias,
  setProductRecommendationsMaxNumberOfRecommendations as setProductRecommendationsMaxNumberOfRecommendationsAlias,
  setProductRecommendationsRecommenderId as setProductRecommendationsRecommenderIdAlias,
  setProductRecommendationsSkus as setProductRecommendationsSkusAlias,
  StateNeededByGetProductRecommendations as StateNeededByGetProductRecommendationsAlias,
} from './product-recommendations/product-recommendations-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadProductRecommendationsActions` instead.
 */
export namespace ProductRecommendationsActions {
  export const setProductRecommendationsBrandFilter = setProductRecommendationsBrandFilterAlias;
  export const buildProductRecommendationsRequest = buildProductRecommendationsRequestAlias;
  export const getProductRecommendations = getProductRecommendationsAlias;
  export const setProductRecommendationsCategoryFilter = setProductRecommendationsCategoryFilterAlias;
  export type GetProductRecommendationsThunkReturn = GetProductRecommendationsThunkReturnAlias;
  export const setProductRecommendationsMaxNumberOfRecommendations = setProductRecommendationsMaxNumberOfRecommendationsAlias;
  export const setProductRecommendationsRecommenderId = setProductRecommendationsRecommenderIdAlias;
  export const setProductRecommendationsSkus = setProductRecommendationsSkusAlias;
  export type StateNeededByGetProductRecommendations = StateNeededByGetProductRecommendationsAlias;
}

export {
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  ProductRecommendationsActionCreators,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  SetProductRecommendationsAdditionalFieldsActionCreatorPayload,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  SetProductRecommendationsBrandFilterActionCreatorPayload,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  SetProductRecommendationsCategoryFilterActionCreatorPayload,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  SetProductRecommendationsMaxNumberOfRecommendationsActionCreatorPayload,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  SetProductRecommendationsRecommenderIdActionCreatorPayload,
  /**
   * @deprecated - The interface is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  SetProductRecommendationsSkusActionCreatorPayload,
  /**
   * @deprecated - The function is moving to a dedicated sub-package. Please access it using "import {...} from '@coveo/headless/product-recommendation'".
   */
  loadProductRecommendationsActions,
} from './product-recommendations/product-recommendations-actions-loader';

import {deselectAllFacets as deselectAllFacetsAlias} from './facets/generic/facet-actions';
/**
 * @deprecated - This namespace will be removed. Please use `loadBreadcrumbActions` instead.
 */
export namespace BreadcrumbActions {
  export const deselectAllFacets = deselectAllFacetsAlias;
}

export * from './facets/generic/breadcrumb-actions-loader';

import {
  getResultProperty as getResultPropertyAlias,
  fieldsMustBeDefined as fieldsMustBeDefinedAlias,
  fieldsMustNotBeDefined as fieldsMustNotBeDefinedAlias,
  fieldMustMatch as fieldMustMatchAlias,
  fieldMustNotMatch as fieldMustNotMatchAlias,
} from './result-templates/result-templates-helpers';
export namespace ResultTemplatesHelpers {
  export const getResultProperty = getResultPropertyAlias;
  export const fieldsMustBeDefined = fieldsMustBeDefinedAlias;
  export const fieldsMustNotBeDefined = fieldsMustNotBeDefinedAlias;
  export const fieldMustMatch = fieldMustMatchAlias;
  export const fieldMustNotMatch = fieldMustNotMatchAlias;
}
