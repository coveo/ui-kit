import {
  BaseFacetSearchRequest,
  FacetSearchType,
} from '../base/base-facet-search-request';

export interface CategoryFacetSearchRequest
  extends BaseFacetSearchRequest,
    FacetSearchType<'hierarchical'> {
  basePath: string[];
  ignorePaths: string[][];
}
