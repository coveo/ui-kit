import {Interception} from 'cypress/types/net-stubbing';
import {SearchRequest} from '../../../headless/dist/api/search/search/search-request';
import {SearchResponseSuccess} from '../../../headless/dist/api/search/search/search-response';

function getApiCall(selector: string): Promise<Interception> {
  return new Promise((resolve) => {
    cy.wait(selector).then((interception) => {
      resolve(interception);
    });
  });
}

export async function getApiResponseBody(
  selector: string
): Promise<SearchResponseSuccess> {
  const interception = await getApiCall(selector);
  return interception.response!.body;
}

export async function getApiRequestBody(
  selector: string
): Promise<SearchRequest> {
  const interception = await getApiCall(selector);
  return interception.request.body;
}

function getAnalytics(selector: string): Promise<Interception> {
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

export async function getApiRequestBodyAt(selector: string, order: number) {
  for (let i = 0; i < order; i++) {
    getApiRequestBody(selector);
  }
  return getApiRequestBody(selector);
}

export function getAnalyticsAt(selector: string, order: number) {
  for (let i = 0; i < order; i++) {
    getAnalytics(selector);
  }
  return getAnalytics(selector);
}
