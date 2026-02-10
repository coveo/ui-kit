import type {BaseParam} from '../../../platform-service-params.js';
import type {
  ClientIdParam,
  ContextParam,
  CountryParam,
  CurrencyParam,
  LanguageParam,
  QueryParam,
  TrackingIdParam,
} from '../../commerce-api-params.js';
import {baseRequest} from '../../common/request.js';

export type CommercePlanRequest = BaseParam &
  TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  QueryParam;

export const getPlanRequestOptions = (req: CommercePlanRequest) => {
  return {
    ...baseRequest(req, 'search/redirect'),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: CommercePlanRequest) => {
  const {trackingId, query, clientId, context, language, country, currency} =
    req;
  return {
    trackingId,
    query,
    clientId,
    context,
    language,
    country,
    currency,
  };
};
