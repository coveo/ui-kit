import {CategoryFacetRequest} from './request';

export type CategoryFacetOptionalParameters = Pick<
  CategoryFacetRequest,
  | 'delimitingCharacter'
  | 'filterFacetCount'
  | 'injectionDepth'
  | 'numberOfValues'
  | 'sortCriteria'
  | 'basePath'
  | 'filterByBasePath'
>;
