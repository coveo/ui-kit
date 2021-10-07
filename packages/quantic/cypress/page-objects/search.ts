// eslint-disable-next-line node/no-unpublished-import
import {CyHttpMessages} from 'cypress/types/net-stubbing';

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
    },
  },
  QuerySuggestions: '@coveoQuerySuggest',
  Search: '@coveoSearch',
  FacetSearch: '@coveoFacetSearch',
};

export function interceptSearch() {
  return cy
    .intercept('POST', '**/rest/ua/v15/analytics/*', (req) => {
      if (req.body.actionCause) {
        req.alias = uaAlias(req.body.actionCause).substring(1);
      } else if (req.body.eventType === 'getMoreResults') {
        req.alias = uaAlias(req.body.eventValue).substring(1);
      }
    })

    .intercept('POST', '**/rest/search/v2/querySuggest?*')
    .as(InterceptAliases.QuerySuggestions.substring(1))

    .intercept('POST', '**/rest/search/v2?*')
    .as(InterceptAliases.Search.substring(1))

    .intercept('POST', '**/rest/search/v2/facet?*')
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
