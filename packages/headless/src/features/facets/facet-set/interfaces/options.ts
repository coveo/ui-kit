import {FacetRequest} from './request';

export type FacetOptionalParameters = Pick<
  FacetRequest,
  'filterFacetCount' | 'injectionDepth' | 'numberOfValues' | 'sortCriteria'
>;
