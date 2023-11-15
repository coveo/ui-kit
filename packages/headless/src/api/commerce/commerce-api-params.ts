import {SortOption} from './product-listings/v2/sort';
import {CommerceFacetRequest} from '../../features/commerce/facets/facet-set/interfaces/request';

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
  facets?: CommerceFacetRequest[];
}

export interface SelectedPageParam {
  page?: number;
}

export interface SelectedSortParam {
  sort?: SortOption;
}
