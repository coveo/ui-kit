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

  // Special case: search/redirect uses a different URL pattern
  // /rest/organizations/{orgId}/commerce/v2 -> /api/v2/organizations/{orgId}/commerce
  if (path === 'search/redirect') {
    return transformToRedirectApiUrl(baseUrl, path);
  }

  return `${baseUrl}/${path}`;
};

/**
 * Transforms the base Commerce API URL to the redirect API URL pattern.
 * Converts: /rest/organizations/{orgId}/commerce/v2
 * To: /api/v2/organizations/{orgId}/commerce/search/redirect
 */
const transformToRedirectApiUrl = (
  baseUrl: string,
  path: CommerceApiMethod
): string => {
  // Extract organization ID from the base URL
  // Pattern: https://{domain}/rest/organizations/{orgId}/commerce/v2
  const match = baseUrl.match(/\/rest\/organizations\/([^/]+)\/commerce\/v2$/);

  if (!match) {
    // Fallback to standard pattern if URL doesn't match expected format
    return `${baseUrl}/${path}`;
  }

  const orgId = match[1];
  const domain = baseUrl.substring(0, baseUrl.indexOf('/rest'));

  return `${domain}/api/v2/organizations/${orgId}/commerce/${path}`;
};
