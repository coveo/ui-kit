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
