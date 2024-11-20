import {Request} from '@playwright/test';

export const searchRequestRegex = /\/rest\/search\/v2\?organizationId=.*/;
export const insightSearchRequestRegex =
  /\/rest\/organizations\/.*\/insight\/v1\/configs\/.*\/search$/;

export const analyticsSearchesUrlRegex =
  /\/rest(\/ua)?\/v15\/analytics\/search(es)?/;
export const analyticsCustomUrlRegex = /\/rest\/v15\/analytics\/custom/;
export const analyticsClickUrlRegex = /\/rest(\/ua)?\/v15\/analytics\/click/;

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
 * Indicates whether the specified request corresponds to a Click Usage Analytics request.
 * @param request The request to check.
 */
export function isUaClickEvent(request: Request): boolean {
  return (
    request.method() === 'POST' && analyticsClickUrlRegex.test(request.url())
  );
}
