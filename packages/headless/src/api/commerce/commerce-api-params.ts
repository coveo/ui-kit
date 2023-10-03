import {FacetValueRequest} from '../../features/facets/facet-set/interfaces/request';
import {AnyFacetRequest} from '../../features/facets/generic/interfaces/generic-facet-request';
import {RangeValueRequest} from '../../features/facets/range-facets/generic/interfaces/range-facet';
import {SortOption} from './product-listings/v2/sort';

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

interface UserIdRequired {
  userId: string;
  email?: string;
}

interface EmailRequired {
  userId?: string;
  email: string;
}

interface UserIdAndEmail {
  userId: string;
  email: string;
}

export type UserParams = (UserIdRequired | EmailRequired | UserIdAndEmail) & {
  userIp?: string;
  userAgent?: string;
};

export interface CartItemParam {
  productId: string;
  quantity: number;
}

export interface SelectedFacetsParam {
  facets?: SelectedFacetParams[];
}

export interface SelectedFacetParams
  extends Pick<AnyFacetRequest, 'field' | 'type' | 'facetId'> {
  currentValues?: (FacetValueRequest | RangeValueRequest)[];
}

export interface SelectedPageParam {
  page?: number;
}

export interface SelectedSortParam {
  sort?: SortOption;
}
