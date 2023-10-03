import {
  HTTPContentType,
  HttpMethods,
  PlatformClientCallOptions,
} from '../../../platform-client';
import {BaseParam} from '../../../platform-service-params';
import {
  ClientIdParam,
  ContextParam,
  LanguageParam,
  CurrencyParam,
  SelectedFacetsParam,
  SelectedPageParam,
  SelectedSortParam,
  TrackingIdParam,
} from '../../commerce-api-params';

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
  const {clientId, context, language, currency, page, facets, sort} = req;
  return {
    refreshCache: true,
    clientId,
    context,
    language,
    currency,
    page,
    facets: (facets || [])
      .filter((facet) => facet.currentValues && facet.currentValues.length > 0)
      .map(({currentValues, ...facet}) => {
        return {
          ...facet,
          values: currentValues,
          // eslint-disable-next-line @cspell/spellchecker
          // TODO CAPI-90, CAPI-91: Handle other facet types
          type: 'regular',
        };
      }),
    sort,
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
