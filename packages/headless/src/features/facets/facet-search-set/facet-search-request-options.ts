import {FacetSearchRequest} from '../../../api/search/facet-search/facet-search/facet-search-request';

export type FacetSearchRequestOptions = Pick<
  FacetSearchRequest,
  'captions' | 'numberOfValues' | 'query'
>;
