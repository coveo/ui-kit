import type {
  BaseFacetSearchRequest,
  FacetSearchType,
} from '../base/base-facet-search-request.js';

export interface CategoryFacetSearchRequest
  extends BaseFacetSearchRequest,
    FacetSearchType<'hierarchical'> {
  basePath: string[];
  ignorePaths: string[][];
  delimitingCharacter: string;
}
