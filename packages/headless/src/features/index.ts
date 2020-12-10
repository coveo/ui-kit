export {updateAdvancedSearchQueries} from './advanced-search-queries/advanced-search-queries-actions';

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

export {
  updateBasicConfiguration,
  updateSearchConfiguration,
  updateAnalyticsConfiguration,
  renewAccessToken,
  disableAnalytics,
  enableAnalytics,
  setOriginLevel2,
  setOriginLevel3,
} from './configuration/configuration-actions';

export {ContextActions} from './context/context-actions';

export {
  registerDateFacet,
  toggleSelectDateFacetValue,
  updateDateFacetSortCriterion,
  deselectAllDateFacetValues,
} from './facets/range-facets/date-facet-set/date-facet-actions';

export {
  enableDidYouMean,
  applyDidYouMeanCorrection,
  disableDidYouMean,
} from './did-you-mean/did-you-mean-actions';

export {registerFieldsToInclude} from './fields/fields-actions';

export {snapshot, back, change, forward} from './history/history-actions';

export {
  registerNumericFacet,
  deselectAllNumericFacetValues,
  toggleSelectNumericFacetValue,
  updateNumericFacetSortCriterion,
} from './facets/range-facets/numeric-facet-set/numeric-facet-actions';

export {
  registerNumberOfResults,
  registerPage,
  nextPage,
  previousPage,
  updateNumberOfResults,
  updatePage,
} from './pagination/pagination-actions';

export {setPipeline} from './pipeline/pipeline-actions';

export {updateQuery} from './query/query-actions';

export {
  registerQuerySetQuery,
  updateQuerySetQuery,
} from './query-set/query-set-actions';

export {
  registerQuerySuggest,
  buildQuerySuggestRequest,
  clearQuerySuggest,
  clearQuerySuggestCompletions,
  fetchQuerySuggestions,
  QuerySuggestionID,
  selectQuerySuggestion,
  StateNeededByQuerySuggest,
  unregisterQuerySuggest,
} from './query-suggest/query-suggest-actions';

export {
  checkForRedirection,
  RedirectionState,
  buildPlanRequest,
} from './redirection/redirection-actions';

export {
  StateNeededByExecuteSearch,
  ExecuteSearchThunkReturn,
  executeSearch,
  buildSearchRequest,
  fetchMoreResults,
} from './search/search-actions';

export {setSearchHub} from './search-hub/search-hub-actions';

export {
  registerSortCriterion,
  updateSortCriterion,
} from './sort-criteria/sort-criteria-actions';

export {
  buildRecommendationRequest,
  getRecommendations,
  GetRecommendationsThunkReturn,
  setRecommendationId,
  StateNeededByGetRecommendations,
} from './recommendation/recommendation-actions';

export {
  setProductRecommendationsBrandFilter,
  buildProductRecommendationsRequest,
  getProductRecommendations,
  setProductRecommendationsCategoryFilter,
  GetProductRecommendationsThunkReturn,
  setProductRecommendationsMaxNumberOfRecommendations,
  setProductRecommendationsRecommenderId,
  setProductRecommendationsSkus,
  StateNeededByGetProductRecommendations,
} from './product-recommendations/product-recommendations-actions';
