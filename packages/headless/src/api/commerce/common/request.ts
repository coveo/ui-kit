import {PlatformClientCallOptions} from '../../platform-client.js';
import {BaseParam} from '../../platform-service-params.js';
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
} from '../commerce-api-params.js';
import {CommerceApiMethod} from '../commerce-metadata.js';

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
  const {url, accessToken} = req;
  const baseUrl = `${url}/${path}`;

  return {
    accessToken,
    method: 'POST',
    contentType: 'application/json',
    url: baseUrl,
    origin: 'commerceApiFetch',
    requestMetadata: {method: path},
  };
};
