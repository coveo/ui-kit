import {SlotIdParam} from '../commerce-api-params.js';
import {CommerceApiMethod} from '../commerce-metadata.js';
import {PaginatedCommerceAPIRequest, baseRequest} from '../common/request.js';

export type CommerceRecommendationsRequest = PaginatedCommerceAPIRequest &
  SlotIdParam;
export const buildRecommendationsRequest = (
  req: CommerceRecommendationsRequest,
  path: CommerceApiMethod
) => {
  return {
    ...baseRequest(req, path),
    requestParams: prepareRecommendationsRequestParams(req),
  };
};

const prepareRecommendationsRequestParams = (
  req: CommerceRecommendationsRequest
) => {
  const {
    slotId,
    trackingId,
    clientId,
    context,
    language,
    country,
    currency,
    page,
    perPage,
  } = req;
  return {
    slotId,
    trackingId,
    clientId,
    context,
    language,
    country,
    currency,
    page,
    perPage,
  };
};
