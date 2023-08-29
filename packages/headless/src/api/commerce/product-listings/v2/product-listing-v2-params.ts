import {FacetValueRequest} from '../../../../features/facets/facet-set/interfaces/request';
import {AnyFacetRequest} from '../../../../features/facets/generic/interfaces/generic-facet-request';
import {RangeValueRequest} from '../../../../features/facets/range-facets/generic/interfaces/range-facet';
import {SortCriterion} from '../../../../features/sort/sort';
import {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../../../platform-client';

export enum Mode {
  Live = 'live',
  Sample = 'sample',
}

export interface SelectedFacets
  extends Pick<AnyFacetRequest, 'field' | 'type' | 'facetId'> {
  values?: (FacetValueRequest | RangeValueRequest)[];
}

export interface Context {
  user: {
    userId?: string;
    email?: string;
    userIp: string;
    userAgent: string;
  };
  view: {
    url: string;
    labels?: Map<string, string>;
  };
  cart?: {
    groupId?: string;
    productId?: string;
    sku?: string;
  }[];
}

export interface ProductListingV2RequestParam {
  platformUrl: string;
  accessToken: string;
  organizationId: string;
  trackingId: string;
  locale: string;
  mode: Mode;
  clientId: string;
  selectedFacets?: SelectedFacets[];
  selectedPage?: {
    page?: number;
  };
  selectedSort?: SortCriterion;
  context: Context;
}

export const baseProductListingV2Request = (
  req: ProductListingV2RequestParam,
  method: HttpMethods,
  contentType: HTTPContentType
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url' | 'origin'
> => {
  const {platformUrl, organizationId, accessToken, trackingId} = req;
  const baseUrl = `${platformUrl}/rest/organizations/${organizationId}/trackings/${trackingId}/commerce/v2/listing`;

  return {
    accessToken,
    method,
    contentType,
    url: baseUrl,
    origin: 'commerceApiFetch',
  };
};
