import {Interception} from 'cypress/types/net-stubbing';
import {Result} from '../../../headless/dist/api/search/search/result';
import {SearchRequest} from '../../../headless/dist/api/search/search/search-request';
import {SearchResponseSuccess} from '../../../headless/dist/api/search/search/search-response';
import {searchEndpoint} from './setupComponent';

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

function getAnalytics(selector: string): Promise<any> {
  return new Promise((resolve) => {
    cy.wait(selector).then((interception) => {
      resolve(interception);
    });
  });
}

export function getAnalyticsAt(selector: string, order: number) {
  for (let i = 0; i < order; i++) {
    getAnalytics(selector);
  }
  return getAnalytics(selector);
}

export function modifySearchResultAt(
  resultModifier: (result: Result) => Result,
  position = 0
) {
  cy.intercept(
    {
      method: 'POST',
      url: searchEndpoint,
    },
    (req) => {
      req.reply((res) => {
        res.body!['results'][position] = resultModifier(
          res.body!['results'][position]
        );
      });
    }
  ).as('coveoSearch');
}
