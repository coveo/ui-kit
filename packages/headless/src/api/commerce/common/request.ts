import {PlatformClientCallOptions} from '../../platform-client';
import {BaseParam} from '../../platform-service-params';
import {
  TrackingIdParam,
  LanguageParam,
  CountryParam,
  CurrencyParam,
  ClientIdParam,
  ContextParam,
  FacetsParam,
  PageParam,
  SortParam,
  PerPageParam,
} from '../commerce-api-params';
import {CommerceApiMethod} from '../commerce-metadata';

export type BaseCommerceAPIRequest = BaseParam &
  TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  PageParam &
  PerPageParam;

export type CommerceAPIRequest = BaseCommerceAPIRequest &
  FacetsParam &
  SortParam;

export const buildRequest = (
  req: CommerceAPIRequest,
  path: CommerceApiMethod
) => {
  return {
    ...baseRequest(req, path),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: CommerceAPIRequest) => {
  const {
    trackingId,
    clientId,
    context,
    language,
    country,
    currency,
    page,
    perPage,
    facets,
    sort,
  } = req;
  return {
    trackingId,
    clientId,
    context,
    language,
    country,
    currency,
    page,
    perPage,
    facets,
    sort,
  };
};

export const baseRequest = (
  req: BaseParam,
  path: CommerceApiMethod
): Pick<
  PlatformClientCallOptions,
  | 'accessToken'
  | 'method'
  | 'contentType'
  | 'url'
  | 'origin'
  | 'requestMetadata'
> => {
  const {url, organizationId, accessToken} = req;
  const baseUrl = `${url}/rest/organizations/${organizationId}/commerce/v2/${path}`;

  return {
    accessToken,
    method: 'POST',
    contentType: 'application/json',
    url: baseUrl,
    origin: 'commerceApiFetch',
    requestMetadata: {method: path},
  };
};
