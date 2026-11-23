import type {
  FacetFieldParam,
  FacetIdParam,
  FacetQueryParam,
  IgnorePathsParam,
  NumberOfValuesParam,
} from '../commerce-api-params.js';
import type {CommerceSearchRequest} from '../search/request.js';

export type CommerceFacetSearchRequest = CommerceSearchRequest &
  FacetIdParam &
  FacetFieldParam &
  FacetQueryParam &
  NumberOfValuesParam;

export type CategoryFacetSearchRequest = CommerceFacetSearchRequest & IgnorePathsParam;

export type FacetSearchType = 'SEARCH' | 'LISTING';
