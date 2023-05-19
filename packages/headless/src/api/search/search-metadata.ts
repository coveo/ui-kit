export type SearchApiMethod =
  | 'plan'
  | 'querySuggest'
  | 'search'
  | 'facetSearch'
  | 'recommendations'
  | 'html'
  | 'productRecommendations'
  | 'fieldDescriptions'
  | 'query';

export type SearchOrigin =
  | 'mainSearch'
  | 'facetValues'
  | 'instantResults'
  | 'foldingCollection';
