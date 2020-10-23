import {
  BaseFacetSearchRequest,
  FacetSearchType,
} from '../base/base-facet-search-request';

export interface SpecificFacetSearchRequest
  extends BaseFacetSearchRequest,
    FacetSearchType<'specific'> {
  ignoreValues: string[];
}
