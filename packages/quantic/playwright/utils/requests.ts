import {Request} from '@playwright/test';

export const searchRequestRegex = /\/rest\/search\/v2\?organizationId=.*/;
export const insightSearchRequestRegex =
  /\/rest\/organizations\/.*\/insight\/v1\/configs\/.*\/search$/;
export const classifyRequestRegex =
  /\/rest\/organizations\/.*\/caseassists\/.*\/classify/;
export const documentsSuggestRequestRegex =
  /\/rest\/organizations\/.*\/caseassists\/.*\/documents\/suggest/;
export const facetRequestRegex = /\/rest\/search\/v2\/facet\?organizationId=.*/;
export const querySuggestRegex =
  /\/rest\/search\/v2\/querySuggest\?organizationId=.*/;
export const insightQuerySuggestRegex =
  /\/rest\/organizations\/.*\/insight\/v1\/configs\/.*\/querysuggest/;

export const analyticsSearchesUrlRegex =
  /\/rest(\/ua)?\/v15\/analytics\/search(es)?/;
export const analyticsCustomUrlRegex = /\/rest\/v15\/analytics\/custom/;
export const analyticsClickUrlRegex = /\/rest(\/ua)?\/v15\/analytics\/click/;
export const analyticsCollectUrlRegex = /\/rest\/v15\/analytics\/collect/;
export const analyticsEventsUrlRegex = /\/rest\/organizations\/.+?\/events\/v1/;
export const searchQuickviewRequestRegex = /\/rest\/search\/v2\/html.*/;
export const insightQuickviewRequestRegex =
  /\/rest\/organizations\/.*\/insight\/v1\/configs\/.*\/quickview/;
export const rgaEvaluationsRequestRegex =
  /\/rest\/organizations\/.*\/answer\/v1\/configs\/.*\/evaluations/;
export const rgaGenerateRequestRegex =
  /\/rest\/organizations\/.*\/answer\/v1\/configs\/.*\/generate/;
export const insightRgaGenerateRequestRegex =
  /\/rest\/organizations\/.*\/insight\/v1\/configs\/.*\/generate/;

/**
 * Indicates whether the specified request corresponds to a Search Usage Analytics request.
 * @param request The request to check.
 */
export function isUaSearchEvent(request: Request): boolean {
  return (
    request.method() === 'POST' && analyticsSearchesUrlRegex.test(request.url())
  );
}

/**
 * Indicates whether the specified request corresponds to a Custom Usage Analytics request.
 * @param request The request to check.
 */
export function isUaCustomEvent(request: Request): boolean {
  return (
    request.method() === 'POST' && analyticsCustomUrlRegex.test(request.url())
  );
}

/**
 * Indicates whether the specified request corresponds to a RGA Evaluation request.
 * @param request The request to check.
 */
export function isRgaEvaluationRequest(request: Request): boolean {
  return (
    request.method() === 'POST' &&
    rgaEvaluationsRequestRegex.test(request.url())
  );
}

/**
 * Indicates whether the specified request corresponds to a Click Usage Analytics request.
 * @param request The request to check.
 */
export function isUaClickEvent(request: Request): boolean {
  return (
    request.method() === 'POST' && analyticsClickUrlRegex.test(request.url())
  );
}

/**
 * Indicates whether the specified request corresponds to a Collect request.
 * @param request The request to check.
 */
export function isCollectEvent(request: Request): boolean {
  return (
    request.method() === 'POST' && analyticsCollectUrlRegex.test(request.url())
  );
}

/**
 * Indicates whether the specified request corresponds to an Event Protocol request.
 * @param request The request to check.
 */
export function isEventProtocol(request: Request): boolean {
  return (
    request.method() === 'POST' && analyticsEventsUrlRegex.test(request.url())
  );
}

/*
 * Indicates whether the specified request corresponds to a search api request.
 * @param request The request to check.
 */
export function isSearchRequest(request: Request): boolean {
  return request.method() === 'POST' && searchRequestRegex.test(request.url());
}
