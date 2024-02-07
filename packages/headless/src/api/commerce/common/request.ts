import {PlatformClientCallOptions} from '../../platform-client';
import {BaseParam} from '../../platform-service-params';
import {
  ClientIdParam,
  ContextParam,
  CurrencyParam,
  LanguageParam,
  FacetsParam,
  PageParam,
  SortParam,
  TrackingIdParam,
  CountryParam,
} from '../commerce-api-params';

export type CommerceAPIRequest = BaseParam &
  TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  FacetsParam &
  PageParam &
  SortParam;

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
