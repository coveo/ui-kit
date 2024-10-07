import {
  FacetIdParam,
  FacetQueryParam,
  IgnorePathsParam,
} from '../commerce-api-params.js';
import {CommerceSearchRequest} from '../search/request.js';

export type CommerceFacetSearchRequest = CommerceSearchRequest &
  FacetIdParam &
  FacetQueryParam;

export type CategoryFacetSearchRequest = CommerceFacetSearchRequest &
  IgnorePathsParam;

export type FacetSearchType = 'SEARCH' | 'LISTING';
