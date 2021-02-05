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

export function getAnalytics(selector: string): Promise<any> {
  return new Promise((resolve) => {
    cy.wait(selector).then((interception) => {
      resolve(interception);
    });
  });
}

export function getApiResponseBodyAt(selector: string, order: number) {
  for (let i = 0; i < order; i++) {
    getApiResponseBody(selector);
  }
  return getApiResponseBody(selector);
}

export function getAnalyticsAt(selector: string, order: number) {
  for (let i = 0; i < order; i++) {
    getAnalytics(selector);
  }
  return getAnalytics(selector);
}
