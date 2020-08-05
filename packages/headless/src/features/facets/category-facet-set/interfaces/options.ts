import {CategoryFacetRequest} from './request';

type CategoryFacetRequiredParameters = Pick<
  CategoryFacetRequest,
  'facetId' | 'field'
>;
type CategoryFacetOptionalParameters = Partial<
  Pick<
    CategoryFacetRequest,
    | 'delimitingCharacter'
    | 'filterFacetCount'
    | 'injectionDepth'
    | 'numberOfValues'
    | 'sortCriteria'
    | 'basePath'
    | 'filterByBasePath'
  >
>;

export type CategoryFacetRegistrationOptions = CategoryFacetRequiredParameters &
  CategoryFacetOptionalParameters;
