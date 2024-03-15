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
  SlotId,
} from '../commerce-api-params';

export type CommerceAPIRequest = BaseParam &
  TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  PageParam &
  FacetsParam &
  SortParam;

export type RecommendationCommerceAPIRequest = BaseParam &
  SlotId &
  TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  PageParam;

export const buildRequest = (req: CommerceAPIRequest, path: string) => {
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
    facets,
    sort,
  };
};

export const buildRecommendationRequest = (
  req: RecommendationCommerceAPIRequest,
  path: string
) => {
  return {
    ...baseRequest(req, path),
    requestParams: prepareRecommendationRequestParams(req),
  };
};

const prepareRecommendationRequestParams = (
  req: RecommendationCommerceAPIRequest
) => {
  const {id, trackingId, clientId, context, language, country, currency, page} =
    req;
  return {
    id,
    trackingId,
    clientId,
    context,
    language,
    country,
    currency,
    page,
  };
};

export const baseRequest = (
  req: BaseParam,
  path: string
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url' | 'origin'
> => {
  const {url, organizationId, accessToken} = req;
  const baseUrl = `${url}/rest/organizations/${organizationId}/commerce/v2/${path}`;

  return {
    accessToken,
    method: 'POST',
    contentType: 'application/json',
    url: baseUrl,
    origin: 'commerceApiFetch',
  };
};
