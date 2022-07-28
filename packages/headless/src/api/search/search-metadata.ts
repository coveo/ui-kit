export type SearchApiMethod =
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
