import {BaseFacetSearchRequest} from '../../../search/facet-search/base/base-facet-search-request.js';
import {FacetSearchType} from '../base/base-facet-search-request.js';

export interface LocationFacetSearchRequest
  extends BaseFacetSearchRequest,
    FacetSearchType<'location'> {
  ignoreValues: string[];
}
