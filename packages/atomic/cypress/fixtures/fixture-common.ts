import {CyHttpMessages} from 'cypress/types/net-stubbing';

export const RouteAlias = {
  UA: '@coveoAnalytics',
  QuerySuggestions: '@coveoQuerySuggest',
  Search: '@coveoSearch',
  FacetSearch: '@coveoFacetSearch',
  Locale: '@locale',
};

export const ConsoleAliases = {
  error: '@consoleError',
  warn: '@consoleWarn',
  log: '@consoleLog',
};

export const UrlParts = {
  UA: 'https://analytics.cloud.coveo.com/rest/ua/v15/analytics',
  Search: 'https://cloud.coveo.com/rest/search/v2',
  UAClick: 'https://analytics.cloud.coveo.com/rest/ua/v15/analytics/click',
  UASearch: 'https://analytics.cloud.coveo.com/rest/ua/v15/analytics/search',
};

export function stubConsole() {
  cy.window().then((win) => {
    cy.stub(win.console, 'error').as(ConsoleAliases.error.substring(1));
    cy.stub(win.console, 'warn').as(ConsoleAliases.warn.substring(1));
    cy.stub(win.console, 'log').as(ConsoleAliases.log.substring(1));
  });
}

export function setupIntercept() {
  cy.intercept({
    method: 'POST',
    path: '**/rest/ua/v15/analytics/*',
  }).as(RouteAlias.UA.substring(1));

  cy.intercept({
    method: 'POST',
    path: '**/rest/search/v2/querySuggest?*',
  }).as(RouteAlias.QuerySuggestions.substring(1));

  cy.intercept({
    method: 'POST',
    url: '**/rest/search/v2?*',
  }).as(RouteAlias.Search.substring(1));

  cy.intercept({
    method: 'POST',
    path: '**/rest/search/v2/facet?*',
  }).as(RouteAlias.FacetSearch.substring(1));

  cy.intercept({
    method: 'GET',
    path: '/build/lang/**.json',
  }).as(RouteAlias.Locale.substring(1));
}

export function getUABody() {
  return cy.get(RouteAlias.UA) as unknown as Promise<{
    request: CyHttpMessages.IncomingHttpRequest;
  }>;
}

export async function getUACustomData() {
  const {request} = await getUABody();
  return request.body.customData as {[key: string]: string | string[]};
}
