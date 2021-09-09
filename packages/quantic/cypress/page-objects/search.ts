export const InterceptAliases = {
  UA: {
    Facet: {
      ClearAll: '@coveoUaFacetClearAll',
      Search: '@coveoUaFacetSearch',
      Select: '@coveoUaFacetSelect',
    },
  },
  QuerySuggestions: '@coveoQuerySuggest',
  Search: '@coveoSearch',
  FacetSearch: '@coveoFacetSearch',
};

export const interceptSearch = () =>
  cy
    .intercept('POST', '**/rest/ua/v15/analytics/*', (req) => {
      switch (req.body.actionCause) {
        case 'facetClearAll':
          req.alias = InterceptAliases.UA.Facet.ClearAll.substring(1);
          break;
        case 'facetSearch':
          req.alias = InterceptAliases.UA.Facet.Search.substring(1);
          break;
        case 'facetSelect':
          req.alias = InterceptAliases.UA.Facet.Select.substring(1);
          break;
      }
    })

    .intercept('POST', '**/rest/search/v2/querySuggest?*')
    .as(InterceptAliases.QuerySuggestions.substring(1))

    .intercept('POST', '**/rest/search/v2?*')
    .as(InterceptAliases.Search.substring(1))

    .intercept('POST', '**/rest/search/v2/facet?*')
    .as(InterceptAliases.FacetSearch.substring(1));
