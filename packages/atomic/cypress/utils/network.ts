import {
  CustomEventRequest,
  EventBaseRequest,
  SearchEventRequest,
} from 'coveo.analytics/dist/definitions/events';
import {SearchResponseSuccess} from '../../../headless/dist/api/search/search/search-response';

export function getApiResponseBody(
  selector: string
): Promise<SearchResponseSuccess> {
  return new Promise((resolve) => {
    cy.wait(selector).then((interception) => {
      resolve(interception.response!.body);
    });
  });
}

export function getAnalytics(selector: string) {
  return new Promise((resolve) => {
    cy.wait(selector).then((interception) => {
      resolve(interception);
    });
  });
}

function getAnalyticsRequest<T = EventBaseRequest>(
  selector: string
): Promise<T> {
  return new Promise((resolve) => {
    cy.wait(selector).then((interception) => {
      resolve(interception.request.body as T);
    });
  });
}

export function getAnalyticsSearchEventRequest(selector: string) {
  return getAnalyticsRequest<SearchEventRequest>(selector);
}

export function getAnalyticsCustomEventRequest(selector: string) {
  return getAnalyticsRequest<CustomEventRequest>(selector);
}
