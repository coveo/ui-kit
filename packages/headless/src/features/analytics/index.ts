import {
  SearchEventPayload as SearchEventPayloadAlias,
  CustomEventPayload as CustomEventPayloadAlias,
  ClickEventPayload as ClickEventPayloadAlias,
  logInterfaceLoad as logInterfaceLoadAlias,
  logInterfaceChange as logInterfaceChangeAlias,
  logClickEvent as logClickEventAlias,
  logCustomEvent as logCustomEventAlias,
  logSearchEvent as logSearchEventAlias,
} from './analytics-actions';
export namespace AnalyticsActions {
  export type SearchEventPayload = SearchEventPayloadAlias;
  export type CustomEventPayload = CustomEventPayloadAlias;
  export type ClickEventPayload = ClickEventPayloadAlias;
  export const logInterfaceLoad = logInterfaceLoadAlias;
  export const logInterfaceChange = logInterfaceChangeAlias;
  export const logClickEvent = logClickEventAlias;
  export const logCustomEvent = logCustomEventAlias;
  export const logSearchEvent = logSearchEventAlias;
}

import {
  logDidYouMeanClick as logDidYouMeanClickAlias,
  logDidYouMeanAutomatic as logDidYouMeanAutomaticAlias,
} from '../did-you-mean/did-you-mean-analytics-actions';
export namespace DidYouMeanAnalyticsActions {
  export const logDidYouMeanClick = logDidYouMeanClickAlias;
  export const logDidYouMeanAutomatic = logDidYouMeanAutomaticAlias;
}

import {
  logFacetShowMore as logFacetShowMoreAlias,
  logFacetShowLess as logFacetShowLessAlias,
  logFacetSelect as logFacetSelectAlias,
  logFacetDeselect as logFacetDeselectAlias,
  logFacetClearAll as logFacetClearAllAlias,
  logFacetSearch as logFacetSearchAlias,
  logFacetUpdateSort as logFacetUpdateSortAlias,
  logFacetBreadcrumb as logFacetBreadcrumbAlias,
} from '../facets/facet-set/facet-set-analytics-actions';
export {
  FacetValueAnalyticPayload,
  FacetUpdateSortAnalyticPayload,
} from '../facets/facet-set/facet-set-analytics-actions';
export namespace FacetAnalyticsActions {
  /**
   * Logs a facet show more event.
   * @param facetId - The unique identifier of the facet (e.g., `"1"`).
   */
  export const logFacetShowMore = logFacetShowMoreAlias;
  /**
   * Logs a facet show less event.
   * @param facetId - The unique identifier of the facet (e.g., `"1"`).
   */
  export const logFacetShowLess = logFacetShowLessAlias;
  /**
   * Logs a facet value selection event.
   * @param payload - Object specifying the target facet and value.
   */
  export const logFacetSelect = logFacetSelectAlias;
  /**
   * Logs a facet deselect event.
   * @param payload - Object specifying the target facet and value.
   */
  export const logFacetDeselect = logFacetDeselectAlias;
  /**
   * Logs a facet clear all event.
   * @param facetId - The unique identifier of the facet (e.g., `"1"`).
   */
  export const logFacetClearAll = logFacetClearAllAlias;
  /**
   * Logs a facet search event.
   * @param facetId - The unique identifier of the facet (e.g., `"1"`).
   */
  export const logFacetSearch = logFacetSearchAlias;
  /**
   * Logs a facet sort event.
   * @param payload - Object specifying the facet and sort criterion.
   */
  export const logFacetUpdateSort = logFacetUpdateSortAlias;
  /**
   * Logs a facet breadcrumb event.
   * @param payload - Object specifying the target facet and value.
   */
  export const logFacetBreadcrumb = logFacetBreadcrumbAlias;
}

import {logClearBreadcrumbs as logClearBreadcrumbsAlias} from '../facets/generic/facet-generic-analytics-actions';
export namespace FacetGenericAnalyticsActions {
  export const logClearBreadcrumbs = logClearBreadcrumbsAlias;
}

import {logDateFacetBreadcrumb as logDateFacetBreadcrumbAlias} from '../facets/range-facets/date-facet-set/date-facet-analytics-actions';
export namespace DateFacetAnalyticsActions {
  export const logDateFacetBreadcrumb = logDateFacetBreadcrumbAlias;
}

import {logNumericFacetBreadcrumb as logNumericFacetBreadcrumbAlias} from '../facets/range-facets/numeric-facet-set/numeric-facet-analytics-actions';
export namespace NumericFacetAnalyticsActions {
  export const logNumericFacetBreadcrumb = logNumericFacetBreadcrumbAlias;
}

import {logCategoryFacetBreadcrumb as logCategoryFacetBreadcrumbAlias} from '../facets/category-facet-set/category-facet-set-analytics-actions';
export namespace CategoryFacetAnalyticsActions {
  export const logCategoryFacetBreadcrumb = logCategoryFacetBreadcrumbAlias;
}

import {
  logNavigateForward as logNavigateForwardAlias,
  logNavigateBackward as logNavigateBackwardAlias,
} from '../history/history-analytics-actions';
export namespace HistoryAnalyticsActions {
  export const logNavigateForward = logNavigateForwardAlias;
  export const logNavigateBackward = logNavigateBackwardAlias;
}

import {
  logPageNext as logPageNextAlias,
  logPagePrevious as logPagePreviousAlias,
  logPageNumber as logPageNumberAlias,
  logPagerResize as logPagerResizeAlias,
} from '../pagination/pagination-analytics-actions';
export namespace PaginationAnalyticsActions {
  export const logPageNext = logPageNextAlias;
  export const logPagePrevious = logPagePreviousAlias;
  export const logPageNumber = logPageNumberAlias;
  export const logPagerResize = logPagerResizeAlias;
}

import {logProductRecommendations as logProductRecommendationsAlias} from '../product-recommendations/product-recommendations-analytics.actions';
export namespace ProductRecommendationAnalyticsActions {
  export const logProductRecommendations = logProductRecommendationsAlias;
}

import {logSearchboxSubmit as logSearchboxSubmitAlias} from '../query/query-analytics-actions';
export namespace QueryAnalyticsActions {
  export const logSearchboxSubmit = logSearchboxSubmitAlias;
}

import {logQuerySuggestionClick as logQuerySuggestionClickAlias} from '../query-suggest/query-suggest-analytics-actions';
export namespace QuerySuggestAnalyticsActions {
  export const logQuerySuggestionClick = logQuerySuggestionClickAlias;
}

import {logRecommendationUpdate as logRecommendationUpdateAlias} from '../recommendation/recommendation-analytics-actions';
export namespace RecommendationAnalyticsActions {
  export const logRecommendationUpdate = logRecommendationUpdateAlias;
}

import {logTriggerRedirect as logTriggerRedirectAlias} from '../redirection/redirection-analytics-actions';
export namespace RedirectionAnalyticsActions {
  export const logTriggerRedirect = logTriggerRedirectAlias;
}

import {logDocumentOpen as logDocumentOpenAlias} from '../result/result-analytics-actions';
export namespace ResultAnalyticsActions {
  export const logDocumentOpen = logDocumentOpenAlias;
}

import {logResultsSort as logResultsSortAlias} from '../sort-criteria/sort-criteria-analytics-actions';
export namespace SortCriterionAnalyticsActions {
  export const logResultsSort = logResultsSortAlias;
}
import {
  logFetchMoreResults as logFetchMoreResultsAlias,
  logQueryError as logQueryErrorAlias,
} from '../search/search-analytics-actions';
export namespace SearchAnalyticsActions {
  export const logFetchMoreResults = logFetchMoreResultsAlias;
  export const logQueryError = logQueryErrorAlias;
}
