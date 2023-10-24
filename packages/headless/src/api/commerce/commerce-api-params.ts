import {CommerceCategoryFacetValueRequest} from '../../features/commerce/facets/category-facet-set/interfaces/request';
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

export interface FacetsParam {
  facets?: FacetsParams[];
}

export interface FacetsParams
  extends Pick<
    AnyFacetRequest,
    'field' | 'type' | 'facetId' | 'numberOfValues'
  > {
  currentValues?: (
    | FacetValueRequest
    | RangeValueRequest
    | CommerceCategoryFacetValueRequest
  )[];
}

export interface SelectedPageParam {
  page?: number;
}

export interface SelectedSortParam {
  selectedSort?: SortCriterion;
}
