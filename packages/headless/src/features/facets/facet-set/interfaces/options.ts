import {FacetRequest} from './request';

type FacetRequiredParameters = Pick<FacetRequest, 'facetId' | 'field'>;

export type FacetOptionalParameters = Pick<
  FacetRequest,
  | 'delimitingCharacter'
  | 'filterFacetCount'
  | 'injectionDepth'
  | 'numberOfValues'
  | 'sortCriteria'
>;

export type FacetRegistrationOptions = FacetRequiredParameters &
  Partial<FacetOptionalParameters>;
