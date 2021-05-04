import {FacetRequest} from './request';

export type FacetOptionalParameters = Pick<
  FacetRequest,
  | 'delimitingCharacter'
  | 'filterFacetCount'
  | 'injectionDepth'
  | 'numberOfValues'
  | 'sortCriteria'
>;
