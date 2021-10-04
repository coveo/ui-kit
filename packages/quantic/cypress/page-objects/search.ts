// eslint-disable-next-line node/no-unpublished-import
import {CyHttpMessages} from 'cypress/types/net-stubbing';

const uaAliasPrefix = '@UA-';

export const InterceptAliases = {
  UA: {
    Facet: {
      ClearAll: uaAliasPrefix + 'facetClearAll',
      Search: uaAliasPrefix + 'facetSearch',
      Select: uaAliasPrefix + 'facetSelect',
    },
    Pager: {
      Previous: uaAliasPrefix + 'pagerPrevious',
      Next: uaAliasPrefix + 'pagerNext',
      Number: uaAliasPrefix + 'pagerNumber',
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
        req.alias = uaAliasPrefix.substring(1) + req.body.actionCause;
      } else if (req.body.eventType === 'getMoreResults') {
        req.alias = uaAliasPrefix.substring(1) + req.body.eventValue;
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
