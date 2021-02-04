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

export function getAnalytics(selector: string): Promise<any> {
  return new Promise((resolve) => {
    cy.wait(selector).then((interception) => {
      resolve(interception);
    });
  });
}
