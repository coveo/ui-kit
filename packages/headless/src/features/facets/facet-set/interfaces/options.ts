import {FacetRequest} from './request';

type FacetRequiredParameters = Pick<FacetRequest, 'facetId' | 'field'>;
type FacetOptionalParameters = Partial<
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
