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
import type {CommerceApiMethod} from '../commerce-metadata.js';

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
