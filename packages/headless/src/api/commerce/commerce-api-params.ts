import {FacetValueRequest} from '../../features/facets/facet-set/interfaces/request';
import {AnyFacetRequest} from '../../features/facets/generic/interfaces/generic-facet-request';
import {RangeValueRequest} from '../../features/facets/range-facets/generic/interfaces/range-facet';
import {SortCriterion} from '../../features/sort/sort';

export interface TrackingIdParam {
  trackingId: string;
}

export interface LanguageParam {
  language: string;
}

export interface CurrencyParam {
  currency: string;
}

export interface ClientIdParam {
  clientId: string;
}

export interface ContextParam {
  context: ContextParams;
}

export interface ContextParams {
  view: ViewParams;
  user?: UserParams;
  cart?: CartItemParam[];
}

export interface ViewParams {
  url: string;
}

export interface UserParams {
  userAgent?: string;
  userIp?: string;
  email?: string;
  userId?: string;
}

export interface CartItemParam {
  productId: string
  quantity: number;
}

export interface SelectedFacetsParam {
  selectedFacets?: SelectedFacetParams[];
}

export interface SelectedFacetParams
  extends Pick<AnyFacetRequest, 'field' | 'type' | 'facetId'> {
  values?: (FacetValueRequest | RangeValueRequest)[];
}

export interface SelectedPageParam {
  page?: number;
}

export interface SelectedSortParam {
  selectedSort?: SortCriterion;
}
