/**
 * Feature related to the SearchAPI client request
 */
export type SearchRequestFeature =
  | 'search/executeSearch'
  | 'search/fetchPage'
  | 'search/fetchMoreResults'
  | 'search/fetchInstantResults'
  | 'search/fetchFacetValues'
  | 'folding/loadCollection'
  | 'querySuggest/fetch'
  | 'redirection/check'
  | 'standaloneSearchBox/fetchRedirect'
  | 'resultPreview/fetchResultContent'
  | 'facetSearch/executeSearch'
  | 'fields/fetchDescription'
  | 'recommendation/get'
  | 'productRecommendations/get';
