import {
  SearchEventRequest,
  ClickEventRequest,
  CustomEventRequest,
} from 'coveo.analytics/src/events';
import {findLast} from './arrayUtils';

export type AnyEventRequest =
  | SearchEventRequest
  | ClickEventRequest
  | CustomEventRequest;

function isSearchEventRequest(
  request: AnyEventRequest
): request is SearchEventRequest {
  return 'results' in request;
}

export function parseClickEventRequest(
  request: AnyEventRequest
): ClickEventRequest | null {
  try {
    return JSON.parse(
      decodeURIComponent(request).replace('clickEvent=', '')
    ) as ClickEventRequest;
  } catch (e) {
    return null;
  }
}

function isClickEventRequest(
  request: AnyEventRequest
): ClickEventRequest | null {
  const parsed = parseClickEventRequest(request);
  return parsed ? 'documentUri' in parsed : null;
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

  static getLastSearchEvent(actionCause: string) {
    return findLast(
      this.analytics,
      (analyticsBody) =>
        isSearchEventRequest(analyticsBody) &&
        analyticsBody.actionCause === actionCause
    ) as SearchEventRequest | null;
  }

  static getLastClickEvent() {
    const last = findLast(this.analytics, isClickEventRequest);
    return parseClickEventRequest(last);
  }

  static getLastCustomEvent(eventType: string) {
    return findLast(
      this.analytics,
      (analyticsBody) =>
        isCustomEventRequest(analyticsBody) &&
        analyticsBody.eventType === eventType
    ) as CustomEventRequest | null;
  }
}
