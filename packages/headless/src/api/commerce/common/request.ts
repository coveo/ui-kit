import {PlatformClientCallOptions} from '../../platform-client';
import {BaseParam} from '../../platform-service-params';
import {
  ClientIdParam,
  ContextParam,
  CurrencyParam,
  LanguageParam,
  SelectedFacetsParam,
  SelectedPageParam,
  SelectedSortParam,
  TrackingIdParam,
} from '../commerce-api-params';

export type CommerceAPIRequest = BaseParam &
  TrackingIdParam &
  LanguageParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  SelectedFacetsParam &
  SelectedPageParam &
  SelectedSortParam;

export const buildRequest = (req: CommerceAPIRequest, path: string) => {
  return {
    ...baseRequest(req, path),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: CommerceAPIRequest) => {
  const {clientId, context, language, currency, page, selectedFacets, sort} =
    req;
  return {
    clientId,
    context,
    language,
    currency,
    page,
    selectedFacets,
    sort,
  };
};

export const baseRequest = (
  req: CommerceAPIRequest,
  path: string
): Pick<
  PlatformClientCallOptions,
  'accessToken' | 'method' | 'contentType' | 'url' | 'origin'
> => {
  const {url, organizationId, accessToken, trackingId} = req;
  const baseUrl = `${url}/rest/organizations/${organizationId}/trackings/${trackingId}/commerce/v2/${path}`;

  return {
    accessToken,
    method: 'POST',
    contentType: 'application/json',
    url: baseUrl,
    origin: 'commerceApiFetch',
  };
};
