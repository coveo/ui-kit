import {
  CyHttpMessages,
  HttpResponseInterceptor,
  RouteMatcher,
  StaticResponse, // eslint-disable-next-line node/no-unpublished-import
} from 'cypress/types/net-stubbing';
import {useCaseEnum} from './use-case';

type RequestParams = Record<string, string | number | boolean | undefined>;

function uaAlias(eventName: string) {
  return `@UA-${eventName}`;
}

function paramsInclude(superset: RequestParams, subset: RequestParams) {
  return Object.keys(subset).reduce((isMatching, key) => {
    return isMatching && superset[key] === subset[key];
  }, true);
}

export const baselineAlias = '@baseline';

export const InterceptAliases = {
  UA: {
    Facet: {
      ClearAll: uaAlias('facetClearAll'),
      Search: uaAlias('facetSearch'),
      Select: uaAlias('facetSelect'),
    },
    Load: uaAlias('interfaceLoad'),
    Pager: {
      Previous: uaAlias('pagerPrevious'),
      Next: uaAlias('pagerNext'),
      Number: uaAlias('pagerNumber'),
      Resize: uaAlias('pagerResize'),
    },
    Sort: {
      SortResults: uaAlias('resultsSort'),
    },
    Tab: {
      InterfaceChange: uaAlias('interfaceChange'),
    },
    Breadcrumb: uaAlias('breadcrumbFacet'),
    DocumentOpen: uaAlias('documentOpen'),
    DocumentQuickview: uaAlias('documentQuickview'),
    SearchFromLink: uaAlias('searchFromLink'),
    CopyToClipboard: uaAlias('copyToClipboard'),
  },
  QuerySuggestions: '@coveoQuerySuggest',
  Search: '@coveoSearch',
  FacetSearch: '@coveoFacetSearch',
  ResultHtml: '@coveoResultHtml',
  Insight: '@CoveoInsight',
};

export const routeMatchers = {
  analytics: '**/rest/ua/v15/analytics/*',
  querySuggest: '**/rest/search/v2/querySuggest?*',
  search: '**/rest/search/v2?*',
  facetSearch: '**/rest/search/v2/facet?*',
  insight: '**/rest/organizations/*/insight/v1/configs/*/search',
  html: '**/rest/search/v2/html?*',
};

export function interceptSearch() {
  return cy
    .intercept('POST', routeMatchers.analytics, (req) => {
      if (req.body.actionCause) {
        req.alias = uaAlias(req.body.actionCause).substring(1);
      } else if (req.body.eventType === 'getMoreResults') {
        req.alias = uaAlias(req.body.eventValue).substring(1);
      }
    })

    .intercept('POST', routeMatchers.querySuggest)
    .as(InterceptAliases.QuerySuggestions.substring(1))

    .intercept('POST', routeMatchers.search)
    .as(InterceptAliases.Search.substring(1))

    .intercept('POST', routeMatchers.facetSearch)
    .as(InterceptAliases.FacetSearch.substring(1))

    .intercept('POST', routeMatchers.insight)
    .as(InterceptAliases.Insight.substring(1));
}

export function interceptSearchWithError(
  statusCode = 400,
  message = '',
  type = '',
  executionReport: Array<Record<string, unknown>> = []
) {
  cy.intercept('POST', routeMatchers.search, {
    statusCode,
    body: {
      statusCode,
      message,
      type,
      executionReport,
    },
  }).as(InterceptAliases.Search.substring(1));
}

export function extractResults(
  response: CyHttpMessages.IncomingResponse | undefined
) {
  if (!response || !response.body) {
    throw new Error('A search response was expected');
  }
  return response.body.results;
}

export function mockNoMoreFacetValues(field: string, useCase?: string) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.facets.find(
        (facet) => facet.field === field
      ).moreValuesAvailable = false;
      res.send();
    });
  }).as(getQueryAlias(useCase).substring(1));
}

export function mockFacetSearchSingleValue(queryString: string) {
  cy.intercept('POST', routeMatchers.facetSearch, (req) => {
    req.continue((res) => {
      res.body.values = [
        {
          displayValue: queryString,
          path: [],
          rawValue: queryString,
          count: 1,
        },
      ];
      res.body.moreValuesAvailable = false;
      res.send();
    });
  }).as(InterceptAliases.FacetSearch.substring(1));
}

export function extractFacetValues(
  response: CyHttpMessages.IncomingResponse | undefined
) {
  if (!response || !response.body) {
    throw new Error('A search response was expected');
  }
  return response.body.facets[0].values.map((v) => v.value);
}

export function interceptIndefinitely(
  requestMatcher: RouteMatcher,
  response?: StaticResponse | HttpResponseInterceptor
): {sendResponse: () => void} {
  let sendResponse;
  const trigger = new Promise((resolve) => {
    sendResponse = resolve;
  });
  cy.intercept(requestMatcher, (request) => {
    return trigger.then(() => {
      request.reply(response);
    });
  });
  return {sendResponse};
}

export function interceptSearchIndefinitely(): {sendResponse: () => void} {
  return interceptIndefinitely(routeMatchers.search);
}

export function mockSearchNoResults(useCase?: string) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.results = [];
      res.body.totalCount = 0;
      res.body.totalCountFiltered = 0;
      res.send();
    });
  }).as(getQueryAlias(useCase).substring(1));
}

export function mockSearchWithResults() {
  cy.intercept(routeMatchers.search, (req) => {
    req.continue((res) => {
      res.body.results = [
        {title: 'Result', uri: 'uri', raw: {urihash: 'resulthash'}},
      ];
      res.body.totalCount = 1;
      res.body.totalCountFiltered = 1;
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function interceptResultHtmlContent() {
  cy.intercept('POST', routeMatchers.html).as(
    InterceptAliases.ResultHtml.substring(1)
  );
}

export function mockResultHtmlContent(tag: string, innerHtml?: string) {
  cy.intercept('POST', routeMatchers.html, (req) => {
    req.alias = InterceptAliases.ResultHtml.substring(1);
    req.continue((res) => {
      const element = document.createElement(tag);
      element.innerHTML = innerHtml ? innerHtml : 'this is a response';
      res.body = element;
      res.send();
    });
  }).as(InterceptAliases.ResultHtml.substring(1));
}

export function interceptQuerySuggestWithParam(
  params: RequestParams,
  alias: string
) {
  cy.intercept('POST', routeMatchers.querySuggest, (req) => {
    if (paramsInclude(req.body, params)) {
      req.alias = alias.substring(1);
    }
  });
}

export function captureBaselineNumberOfRequests(interceptAlias: string) {
  cy.get(`${interceptAlias}.all`).then((calls) =>
    cy.wrap(calls.length).as(baselineAlias.substring(1))
  );
}

export function getQueryAlias(useCase?: string) {
  return useCase === useCaseEnum.insight
    ? InterceptAliases.Insight
    : InterceptAliases.Search;
}

export function getRoute(useCase?: string) {
  return useCase === useCaseEnum.insight
    ? routeMatchers.insight
    : routeMatchers.search;
}

export function mockSearchWithoutAnyFacetValues() {
  cy.intercept(routeMatchers.search, (req) => {
    req.continue((res) => {
      res.body.facets.forEach((facet: {values: string[]}) => {
        facet.values = [];
      });
      res.body.results = [
        {title: 'Result', uri: 'uri', raw: {urihash: 'resulthash'}},
      ];
      res.body.totalCount = 1;
      res.body.totalCountFiltered = 1;
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}
