import {SpecificFacetSearchRequest} from '../../../api/search/facet-search/specific-facet-search-request';

export type FacetSearchRequestOptions = Pick<
  SpecificFacetSearchRequest,
  'captions' | 'numberOfValues' | 'query'
>;
