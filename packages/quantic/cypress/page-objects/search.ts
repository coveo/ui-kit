import {
  CyHttpMessages,
  HttpResponseInterceptor,
  RouteMatcher,
  StaticResponse,
  // eslint-disable-next-line node/no-unpublished-import
} from 'cypress/types/net-stubbing';

function uaAlias(eventName: string) {
  return `@UA-${eventName}`;
}

export const InterceptAliases = {
  UA: {
    Facet: {
      ClearAll: uaAlias('facetClearAll'),
      Search: uaAlias('facetSearch'),
      Select: uaAlias('facetSelect'),
    },
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
  },
  QuerySuggestions: '@coveoQuerySuggest',
  Search: '@coveoSearch',
  FacetSearch: '@coveoFacetSearch',
};

export const routeMatchers = {
  analytics: '**/rest/ua/v15/analytics/*',
  querySuggest: '**/rest/search/v2/querySuggest?*',
  search: '**/rest/search/v2?*',
  facetSearch: '**/rest/search/v2/facet?*',
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
    .as(InterceptAliases.FacetSearch.substring(1));
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
