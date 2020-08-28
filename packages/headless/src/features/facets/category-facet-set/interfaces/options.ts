import {CategoryFacetRequest} from './request';

type CategoryFacetRequiredParameters = Pick<
  CategoryFacetRequest,
  'facetId' | 'field'
>;

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

export type CategoryFacetRegistrationOptions = CategoryFacetRequiredParameters &
  Partial<CategoryFacetOptionalParameters>;
