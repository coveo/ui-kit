import {SlotIdParam} from '../commerce-api-params';
import {BaseCommerceAPIRequest, baseRequest} from '../common/request';

export type CommerceRecommendationRequest = BaseCommerceAPIRequest &
  SlotIdParam;
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
