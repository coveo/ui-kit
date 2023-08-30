import {FacetValueRequest} from '../../features/facets/facet-set/interfaces/request';
import {AnyFacetRequest} from '../../features/facets/generic/interfaces/generic-facet-request';
import {RangeValueRequest} from '../../features/facets/range-facets/generic/interfaces/range-facet';
import {SortCriterion} from '../../features/sort/sort';

export interface TrackingIdParam {
  trackingId: string;
}

export interface LocaleParam {
  locale: string;
}

export interface ModeParam {
  mode?: Mode;
}

export type Mode = 'live' | 'sample';

export interface ClientIdParam {
  clientId: string;
}

export interface ContextParam {
  context: ContextParameters;
}

export interface ContextParameters {
  user: UserParameters;
  view: ViewParameters;
  cart?: CartProductParameters[];
}

export interface UserParameters {
  userAgent: string;
  userIp: string;
  email?: string;
  userId?: string;
}

export interface ViewParameters {
  url: string;
  labels?: Record<string, string>;
}

export interface CartProductParameters {
  groupId?: string;
  productId?: string;
  sku?: string;
}

export interface SelectedFacetsParam {
  selectedFacets?: SelectedFacetParameters[];
}

export interface SelectedFacetParameters
  extends Pick<AnyFacetRequest, 'field' | 'type' | 'facetId'> {
  values?: (FacetValueRequest | RangeValueRequest)[];
}

export interface SelectedPageParam {
  page?: number;
}

export interface SelectedSortParam {
  selectedSort?: SortCriterion;
}
