import {updateAdvancedSearchQueries as updateAdvancedSearchQueriesAlias} from './advanced-search-queries/advanced-search-queries-actions';
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

import {
  setContext as setContextAlias,
  addContext as addContextAlias,
  removeContext as removeContextAlias,
} from './context/context-actions';
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
export namespace DidYouMeanActions {
  export const enableDidYouMean = enableDidYouMeanAlias;
  export const applyDidYouMeanCorrection = applyDidYouMeanCorrectionAlias;
  export const disableDidYouMean = disableDidYouMeanAlias;
}

export * from './did-you-mean/did-you-mean-actions-loader';

import {registerFieldsToInclude as registerFieldsToIncludeAlias} from './fields/fields-actions';
export namespace FieldActions {
  export const registerFieldsToInclude = registerFieldsToIncludeAlias;
}
import {
  snapshot as snapshotAlias,
  back as backAlias,
  change as changeAlias,
  forward as forwardAlias,
} from './history/history-actions';
export namespace HistoryActions {
  export const snapshot = snapshotAlias;
  export const back = backAlias;
  export const change = changeAlias;
  export const forward = forwardAlias;
}
import {
  registerNumericFacet as registerNumericFacetAlias,
  deselectAllNumericFacetValues as deselectAllNumericFacetValuesAlias,
  toggleSelectNumericFacetValue as toggleSelectNumericFacetValueAlias,
  updateNumericFacetSortCriterion as updateNumericFacetSortCriterionAlias,
} from './facets/range-facets/numeric-facet-set/numeric-facet-actions';
export namespace NumericFacetActions {
  export const registerNumericFacet = registerNumericFacetAlias;
  export const deselectAllNumericFacetValues = deselectAllNumericFacetValuesAlias;
  export const toggleSelectNumericFacetValue = toggleSelectNumericFacetValueAlias;
  export const updateNumericFacetSortCriterion = updateNumericFacetSortCriterionAlias;
}

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
export namespace PaginationActions {
  export const registerNumberOfResults = registerNumberOfResultsAlias;
  export const registerPage = registerPageAlias;
  export const nextPage = nextPageAlias;
  export const previousPage = previousPageAlias;
  export const updateNumberOfResults = updateNumberOfResultsAlias;
  export const updatePage = updatePageAlias;
}

import {setPipeline as setPipelineAlias} from './pipeline/pipeline-actions';
export namespace PipelineActions {
  export const setPipeline = setPipelineAlias;
}

import {updateQuery as updateQueryAlias} from './query/query-actions';
export namespace QueryActions {
  export const updateQuery = updateQueryAlias;
}

import {
  registerQuerySetQuery as registerQuerySetQueryAlias,
  updateQuerySetQuery as updateQuerySetQueryAlias,
} from './query-set/query-set-actions';
export namespace QuerySetActions {
  export const registerQuerySetQuery = registerQuerySetQueryAlias;
  export const updateQuerySetQuery = updateQuerySetQueryAlias;
}

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

import {
  checkForRedirection as checkForRedirectionAlias,
  RedirectionState as RedirectionStateAlias,
  buildPlanRequest as buildPlanRequestAlias,
} from './redirection/redirection-actions';
export namespace RedirectionActions {
  export const checkForRedirection = checkForRedirectionAlias;
  export type RedirectionState = RedirectionStateAlias;
  export const buildPlanRequest = buildPlanRequestAlias;
}

import {
  StateNeededByExecuteSearch as StateNeededByExecuteSearchAlias,
  ExecuteSearchThunkReturn as ExecuteSearchThunkReturnAlias,
  executeSearch as executeSearchAlias,
  buildSearchRequest as buildSearchRequestAlias,
  fetchMoreResults as fetchMoreResultsAlias,
} from './search/search-actions';
export namespace SearchActions {
  export type StateNeededByExecuteSearch = StateNeededByExecuteSearchAlias;
  export type ExecuteSearchThunkReturn = ExecuteSearchThunkReturnAlias;
  export const executeSearch = executeSearchAlias;
  export const buildSearchRequest = buildSearchRequestAlias;
  export const fetchMoreResults = fetchMoreResultsAlias;
}

export * from './search/search-actions-loader';

import {setSearchHub as setSearchHubAlias} from './search-hub/search-hub-actions';
export namespace SearchHubActions {
  export const setSearchHub = setSearchHubAlias;
}

import {
  registerSortCriterion as registerSortCriterionAlias,
  updateSortCriterion as updateSortCriterionAlias,
} from './sort-criteria/sort-criteria-actions';
export namespace SortCriterionActions {
  export const registerSortCriterion = registerSortCriterionAlias;
  export const updateSortCriterion = updateSortCriterionAlias;
}

import {
  buildRecommendationRequest as buildRecommendationRequestAlias,
  getRecommendations as getRecommendationsAlias,
  GetRecommendationsThunkReturn as GetRecommendationsThunkReturnAlias,
  setRecommendationId as setRecommendationIdAlias,
  StateNeededByGetRecommendations as StateNeededByGetRecommendationsAlias,
} from './recommendation/recommendation-actions';
export namespace RecommendationActions {
  export const buildRecommendationRequest = buildRecommendationRequestAlias;
  export const getRecommendations = getRecommendationsAlias;
  export type GetRecommendationsThunkReturn = GetRecommendationsThunkReturnAlias;
  export const setRecommendationId = setRecommendationIdAlias;
  export type StateNeededByGetRecommendations = StateNeededByGetRecommendationsAlias;
}

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

import {deselectAllFacets as deselectAllFacetsAlias} from './facets/generic/facet-actions';
export namespace BreadcrumbActions {
  export const deselectAllFacets = deselectAllFacetsAlias;
}

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
