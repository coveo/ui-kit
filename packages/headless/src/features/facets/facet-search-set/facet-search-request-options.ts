import {FacetSearchRequestOptions} from '../../../api/search/facet-search/base/base-facet-search-request';
import {BaseFacetRequest} from '../facet-api/request';

export type FacetSearchOptions = Pick<BaseFacetRequest, 'facetId'> &
  Partial<FacetSearchRequestOptions>;
