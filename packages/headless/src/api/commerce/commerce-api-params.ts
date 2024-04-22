import {AnyFacetRequest} from '../../features/commerce/facets/facet-set/interfaces/request';
import {SortOption} from './common/sort';

export interface TrackingIdParam {
  trackingId: string;
}

export interface LanguageParam {
  language: string;
}

export interface CountryParam {
  country: string;
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
  referrer?: string;
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
  sku: string;
  quantity: number;
}

export interface FacetsParam {
  facets?: AnyFacetRequest[];
}

export interface PageParam {
  page?: number;
}

export interface PerPageParam {
  perPage?: number;
}

export interface SortParam {
  sort?: SortOption;
}

export interface QueryParam {
  query?: string;
}

export interface FacetQueryParam {
  facetQuery: string;
}

export interface FacetIdParam {
  facetId: string;
}

export interface IgnorePathsParam {
  ignorePaths: string[][];
}

export interface SlotIdParam {
  id: string;
}
