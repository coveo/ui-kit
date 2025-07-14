import type {CategoryFacetRequest} from './request.js';

export type CategoryFacetOptionalParameters = Pick<
  CategoryFacetRequest,
  | 'delimitingCharacter'
  | 'filterFacetCount'
  | 'injectionDepth'
  | 'numberOfValues'
  | 'sortCriteria'
  | 'basePath'
  | 'filterByBasePath'
  | 'resultsMustMatch'
>;
