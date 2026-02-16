import type {PlacementIdsParam} from '../commerce-api-params.js';
import {type BaseCommerceAPIRequest, baseRequest} from '../common/request.js';

export type ProductEnrichmentBadgesRequest = BaseCommerceAPIRequest &
  PlacementIdsParam;

export const buildProductEnrichmentBadgesRequest = (
  req: ProductEnrichmentBadgesRequest
) => {
  return {
    ...baseRequest(req, 'badges'),
    requestParams: prepareProductEnrichmentRequestParams(req),
  };
};

const prepareProductEnrichmentRequestParams = (
  req: ProductEnrichmentBadgesRequest
) => {
  const {language, country, currency, placementIds, context, clientId} = req;

  return {
    language,
    country,
    currency,
    placementIds,
    context,
    ...(clientId && {clientId}),
  };
};
