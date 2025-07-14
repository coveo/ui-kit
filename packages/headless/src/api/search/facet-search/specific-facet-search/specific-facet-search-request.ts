import type {
  BaseFacetSearchRequest,
  FacetSearchType,
} from '../base/base-facet-search-request.js';

export interface SpecificFacetSearchRequest
  extends BaseFacetSearchRequest,
    FacetSearchType<'specific'> {
  ignoreValues: string[];
}
