import {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../../../platform-client.js';
import {BaseParam} from '../../../platform-service-params.js';
import {
  ClientIdParam,
  ContextParam,
  LanguageParam,
  CurrencyParam,
  SelectedFacetsParam,
  SelectedPageParam,
  SelectedSortParam,
  TrackingIdParam,
} from '../../commerce-api-params.js';

export type ProductListingV2Request = BaseParam &
  TrackingIdParam &
  LanguageParam &
  CurrencyParam &
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
  const {
    clientId,
    context,
    language,
    currency,
    page,
    selectedFacets,
    selectedSort,
  } = req;
  return {
    clientId,
    context,
    language,
    currency,
    page,
    selectedFacets,
    selectedSort,
  };
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
