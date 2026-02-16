import type {
  FacetIdParam,
  FacetQueryParam,
  IgnorePathsParam,
  NumberOfValuesParam,
} from '../commerce-api-params.js';
import type {CommerceSearchRequest} from '../search/request.js';

export type CommerceFacetSearchRequest = CommerceSearchRequest &
  FacetIdParam &
  FacetQueryParam &
  NumberOfValuesParam;

export type CategoryFacetSearchRequest = CommerceFacetSearchRequest &
  IgnorePathsParam;

export type FacetSearchType = 'SEARCH' | 'LISTING';
