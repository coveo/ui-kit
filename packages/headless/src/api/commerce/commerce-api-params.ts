import type {AnyFacetRequest} from '../../features/commerce/facets/facet-set/interfaces/request.js';
import type {SortOption} from './common/sort.js';

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
  clientId?: string;
}

export interface ContextParam {
  context: ContextParams;
}

export interface EnableResultsParam {
  enableResults: boolean;
}

type ProductParam = {
  productId: string;
};

type ContextParams = {
  view: ViewParams;
  user?: UserParams;
  product?: ProductParam;
  cart?: CartItemParam[];
  purchased?: CartItemParam[];
  capture: boolean;
  source: string[];
};

export interface ViewParams {
  url: string;
  referrer?: string;
}

export type UserParams = {
  userAgent?: string;
  latitude?: number;
  longitude?: number;
};

export interface CartItemParam {
  /**
   * The unique identifier of the product.
   */
  productId: string;
  /**
   * The quantity of the product in the cart.
   */
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

export interface NumberOfValuesParam {
  numberOfValues: number;
}

export interface FacetIdParam {
  facetId: string;
}

export interface IgnorePathsParam {
  ignorePaths: string[][];
}

export interface SlotIdParam {
  slotId: string;
}

export interface PlacementIdsParam {
  placementIds?: string[];
}
