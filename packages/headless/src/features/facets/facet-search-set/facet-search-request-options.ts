import type {FacetSearchRequestOptions} from '../../../api/search/facet-search/base/base-facet-search-request.js';
import type {BaseFacetRequest} from '../facet-api/request.js';

export type FacetSearchOptions = Pick<BaseFacetRequest, 'facetId'> &
  Partial<FacetSearchRequestOptions>;
