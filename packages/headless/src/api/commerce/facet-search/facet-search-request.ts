import {
  FacetIdParam,
  FacetQueryParam,
  IgnorePathsParam,
} from '../commerce-api-params';
import {CommerceSearchRequest} from '../search/request';

export type CommerceFacetSearchRequest = CommerceSearchRequest &
  FacetIdParam &
  FacetQueryParam;

export type CategoryFacetSearchRequest = CommerceFacetSearchRequest &
  IgnorePathsParam;

export type FacetSearchType = 'SEARCH' | 'LISTING';
