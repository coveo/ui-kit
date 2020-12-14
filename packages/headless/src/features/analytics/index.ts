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
} from '../facets/facet-set/facet-set-analytics-actions';
export namespace FacetAnalyticsActions {
  export const logFacetShowMore = logFacetShowMoreAlias;
  export const logFacetShowLess = logFacetShowLessAlias;
  export const logFacetSelect = logFacetSelectAlias;
  export const logFacetDeselect = logFacetDeselectAlias;
  export const logFacetClearAll = logFacetClearAllAlias;
  export const logFacetSearch = logFacetSearchAlias;
  export const logFacetUpdateSort = logFacetUpdateSortAlias;
}

import {logClearBreadcrumbs as logClearBreadcrumbsAlias} from '../facets/generic/facet-generic-analytics-actions';
export namespace FacetGenericAnalyticsActions {
  export const logClearBreadcrumbs = logClearBreadcrumbsAlias;
}

import {
  logNavigateForward as logNavigateForwardAlias,
  logNavigateBackward as logNavigateBackwardAlias,
} from '../history/history-analytics-actions';
export namespace HistoryAnalyticsActions{
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
export namespace ProductRecommendationAnalyticsActions{
  export const logProductRecommendations = logProductRecommendationsAlias;
}

import {logSearchboxSubmit as logSearchboxSubmitAlias} from '../query/query-analytics-actions';
export namespace QueryAnalyticsActions {
  export logSearchboxSubmit = logSearchboxSubmitAlias;
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
export namespace RedirectionAnalyticsActions{
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
