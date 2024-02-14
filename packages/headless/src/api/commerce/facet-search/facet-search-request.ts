import {FacetIdParam, FacetQueryParam} from '../commerce-api-params';
import {CommerceSearchRequest} from '../search/request';

export type CommerceFacetSearchRequest = CommerceSearchRequest &
  FacetIdParam &
  FacetQueryParam;
