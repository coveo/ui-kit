import {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../../../platform-client';
import {BaseParam} from '../../../platform-service-params';
import {
  ClientIdParam,
  ContextParam,
  LocaleParam,
  ModeParam,
  SelectedFacetsParam,
  SelectedPageParam,
  SelectedSortParam,
  TrackingIdParam,
} from '../../commerce-api-params';

export type ProductListingV2Request = BaseParam &
  TrackingIdParam &
  LocaleParam &
  ModeParam &
  ClientIdParam &
  ContextParam &
  SelectedFacetsParam &
  SelectedPageParam &
  SelectedSortParam;

export const buildProductListingV2Request = (req: ProductListingV2Request) => {
  return {
    ...baseProductListingV2Request(req, 'POST', 'application/json'),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: ProductListingV2Request) => {
  const {...params} = req;
  return params;
};

export const baseProductListingV2Request = (
  req: ProductListingV2Request,
  method: HttpMethods,
  contentType: HTTPContentType
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url' | 'origin'
> => {
  const {url, organizationId, accessToken, trackingId} = req;
  const baseUrl = `${url}/rest/organizations/${organizationId}/trackings/${trackingId}/commerce/v2/listing`;

  return {
    accessToken,
    method,
    contentType,
    url: baseUrl,
    origin: 'commerceApiFetch',
  };
};
