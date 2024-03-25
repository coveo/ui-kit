import {BaseParam} from '../../platform-service-params';
import {
  ClientIdParam,
  ContextParam,
  CountryParam,
  CurrencyParam,
  LanguageParam,
  PageParam,
  QueryParam,
  SlotIdParam,
  TrackingIdParam,
} from '../commerce-api-params';
import {CommerceAPIRequest, baseRequest} from '../common/request';

export type CommerceSearchRequest = CommerceAPIRequest & QueryParam;

export type CommerceRecommendationRequest = BaseParam &
  SlotIdParam &
  TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  PageParam;

export const buildRecommendationRequest = (
  req: CommerceRecommendationRequest,
  path: string
) => {
  return {
    ...baseRequest(req, path),
    requestParams: prepareRecommendationRequestParams(req),
  };
};

const prepareRecommendationRequestParams = (
  req: CommerceRecommendationRequest
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
