import {
  BaseFacetSearchRequest,
  FacetSearchType,
} from '../base/base-facet-search-request.js';

export interface LocationFacetSearchRequest
  extends BaseFacetSearchRequest,
    FacetSearchType<'location'> {
  ignoreValues: string[];
}
