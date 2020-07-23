import {FacetRequest} from './request';

type FacetRequiredParameters = Pick<FacetRequest, 'facetId' | 'field'>;
export type FacetOptionalParameters = Partial<
  Pick<
    FacetRequest,
    | 'delimitingCharacter'
    | 'filterFacetCount'
    | 'injectionDepth'
    | 'numberOfValues'
    | 'sortCriteria'
  >
>;

export type FacetRegistrationOptions = FacetRequiredParameters &
  FacetOptionalParameters;
