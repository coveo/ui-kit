import type {PlatformClientCallOptions} from '../../platform-client.js';
import type {BaseParam} from '../../platform-service-params.js';
import type {
  ClientIdParam,
  ContextParam,
  CountryParam,
  CurrencyParam,
  FacetsParam,
  LanguageParam,
  PageParam,
  PerPageParam,
  SortParam,
  TrackingIdParam,
} from '../commerce-api-params.js';
import {
  type CommerceApiMethod,
  TRACKING_ID_IN_PATH_METHODS,
} from '../commerce-metadata.js';

export type BaseCommerceAPIRequest = BaseParam &
  TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam;

export type PaginatedCommerceAPIRequest = BaseCommerceAPIRequest &
  PageParam &
  PerPageParam;

export type FilterableCommerceAPIRequest = PaginatedCommerceAPIRequest &
  FacetsParam &
  SortParam;

export const getRequestOptions = (
  req: FilterableCommerceAPIRequest,
  path: CommerceApiMethod
) => {
  return {
    ...baseRequest(req, path),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: FilterableCommerceAPIRequest) => {
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
  req: BaseCommerceAPIRequest,
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
  const {url, trackingId, accessToken} = req;

  const baseUrl = buildUrlWithTrackingIdInPath(url, trackingId, path);

  return {
    accessToken,
    method: 'POST',
    contentType: 'application/json',
    url: baseUrl,
    origin: 'commerceApiFetch',
    requestMetadata: {method: path},
  };
};

/**
 * Builds a URL to include the tracking ID in the path.
 * Used by endpoints that require tracking ID in the URL path instead of request body.
 **/
const buildUrlWithTrackingIdInPath = (
  baseUrl: string,
  trackingId: string,
  path: CommerceApiMethod
): string => {
  if (trackingId && TRACKING_ID_IN_PATH_METHODS.includes(path)) {
    return `${baseUrl}/tracking-ids/${trackingId}/${path}`;
  }
  return `${baseUrl}/${path}`;
};
