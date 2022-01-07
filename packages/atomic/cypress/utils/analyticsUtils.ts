import {CoveoAnalyticsClient} from '@coveo/headless/node_modules/coveo.analytics';
import {findLast} from './arrayUtils';

export type SearchEventRequest = Parameters<
  CoveoAnalyticsClient['sendSearchEvent']
>[0];

export type ClickEventRequest = Parameters<
  CoveoAnalyticsClient['sendClickEvent']
>[0];

export type CustomEventRequest = Parameters<
  CoveoAnalyticsClient['sendCustomEvent']
>[0];

export type AnyEventRequest =
  | SearchEventRequest
  | ClickEventRequest
  | CustomEventRequest;

function isSearchEventRequest(
  request: AnyEventRequest
): request is SearchEventRequest {
  return 'actionCause' in request;
}

function isClickEventRequest(
  request: AnyEventRequest
): request is ClickEventRequest {
  return 'documentUri' in request;
}

function isCustomEventRequest(
  request: AnyEventRequest
): request is CustomEventRequest {
  return 'eventType' in request;
}

const analyticsEventsKey = '_analyticsEvents';

interface WindowWithAnalytics extends Window {
  [analyticsEventsKey]?: AnyEventRequest[];
}

export class AnalyticsTracker {
  private static get window() {
    return window as WindowWithAnalytics;
  }

  private static get analytics() {
    return (this.window[analyticsEventsKey] =
      this.window[analyticsEventsKey] ?? []);
  }

  private static set analytics(analytics: AnyEventRequest[]) {
    this.window[analyticsEventsKey] = analytics;
  }

  static push(request: AnyEventRequest) {
    this.analytics.push(request);
  }

  static reset() {
    this.analytics = [];
  }

  static getLastSearchEvent() {
    return findLast(
      this.analytics,
      isSearchEventRequest
    ) as SearchEventRequest | null;
  }

  static getLastClickEvent() {
    return findLast(
      this.analytics,
      isClickEventRequest
    ) as ClickEventRequest | null;
  }

  static getLastCustomEvent() {
    return findLast(
      this.analytics,
      isCustomEventRequest
    ) as CustomEventRequest | null;
  }
}
