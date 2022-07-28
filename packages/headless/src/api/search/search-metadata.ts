export type SearchApiClientMethod =
  | 'plan'
  | 'querySuggest'
  | 'search'
  | 'facetSearch'
  | 'recommendations'
  | 'html'
  | 'productRecommendations'
  | 'fieldDescriptions';

export type SearchOrigin =
  | 'mainSearch'
  | 'facetValues'
  | 'instantResults'
  | 'foldingCollection';
