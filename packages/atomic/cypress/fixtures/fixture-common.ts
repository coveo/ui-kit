import {CyHttpMessages} from 'cypress/types/net-stubbing';
import {i18n} from 'i18next';
import {SearchResponseSuccess} from '../../../headless/dist/definitions/api/search/search/search-response';
import {AnalyticsTracker, AnyEventRequest} from '../utils/analyticsUtils';

export type SearchResponseModifierPredicate = (
  response: SearchResponseSuccess
) => SearchResponseSuccess | void;

export interface SearchResponseModifier {
  predicate: SearchResponseModifierPredicate;
  times: number;
}

export type FieldCaptions = {field: string; captions: Record<string, string>}[];

export type Translations = Record<string, string>;

export type TestFeature<T> = (e: T) => void | Promise<void>;

export type TagProps = Record<string, string | number | boolean>;

export const RouteAlias = {
  UA: '@coveoAnalytics',
  QuerySuggestions: '@coveoQuerySuggest',
  Search: '@coveoSearch',
  FacetSearch: '@coveoFacetSearch',
  Quickview: '@coveoQuickview',
  Locale: '@locale',
  GenQAStream: '@genQAStream',
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

export function spyConsole() {
  cy.window().then((win) => {
    cy.spy(win.console, 'error').as(ConsoleAliases.error.substring(1));
    cy.spy(win.console, 'warn').as(ConsoleAliases.warn.substring(1));
    cy.spy(win.console, 'log').as(ConsoleAliases.log.substring(1));
  });
}

export function setupIntercept() {
  cy.intercept({
    method: 'POST',
    path: '**/rest/v15/analytics/*',
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
    url: '**/rest/search/v2/html?*',
  }).as(RouteAlias.Quickview.substring(1));

  cy.intercept({
    method: 'POST',
    path: '**/rest/search/v2/facet?*',
  }).as(RouteAlias.FacetSearch.substring(1));

  cy.intercept({
    method: 'GET',
    path: '/lang/**.json',
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

export function interceptSearchAndReturnError() {
  cy.intercept(
    {
      method: 'POST',
      url: '**/rest/search/v2?*',
    },
    (request) =>
      request.reply((response) =>
        response.send(418, {
          ok: false,
          status: 418,
          message: 'Something very weird just happened',
          statusCode: 418,
          type: 'ClientError',
        })
      )
  ).as(RouteAlias.Search.substring(1));
}

export function interceptSearchResponse(
  modifier: SearchResponseModifierPredicate,
  times = 9999
) {
  cy.intercept(
    {
      method: 'POST',
      url: '**/rest/search/v2?*',
      times,
    },
    (request) => {
      request.reply((response) => {
        let newResponse = response.body;
        const returnedResponse = modifier(newResponse);
        if (returnedResponse) {
          newResponse = returnedResponse;
        }
        response.send(200, newResponse);
      });
    }
  ).as(RouteAlias.Search.substring(1));
}

export function modifySearchResponses(
  responseModifiers: SearchResponseModifier[]
) {
  interceptSearchResponse((response) => {
    let combinedResponse = response;
    responseModifiers.forEach((modifier) => {
      if (modifier.times <= 0) {
        return;
      }
      combinedResponse =
        modifier.predicate(combinedResponse) || combinedResponse;
      modifier.times--;
    });
    return combinedResponse;
  });
}

export const sampleConfig = {
  accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
  organizationId: 'searchuisamples',
  analytics: {
    analyticsMode: 'legacy',
  },
};

export function configureI18n(
  i18n: i18n,
  translations: Translations,
  fieldCaptions: FieldCaptions
) {
  fieldCaptions.forEach(({field, captions}) =>
    i18n.addResourceBundle('en', `caption-${field}`, captions)
  );
  i18n.addResourceBundle('en', 'translation', translations);
}

export function interceptAnalytics() {
  AnalyticsTracker.reset();
  cy.intercept(
    {
      method: 'POST',
      url: '**/rest/v15/analytics/*',
    },
    (request) => AnalyticsTracker.push(request.body as AnyEventRequest)
  );
}

export const addTag = (
  env: {withElement(e: HTMLElement): void},
  tag: string,
  props: TagProps
) => {
  const e = generateComponentHTML(tag, props);
  env.withElement(e);
};

export const generateComponentHTML = (tag: string, props: TagProps = {}) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    e.setAttribute(k, v.toString());
  }
  return e;
};
