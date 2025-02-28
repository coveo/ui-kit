import {BaseParam} from '../../../platform-service-params.js';
import {
  ClientIdParam,
  CurrencyParam,
  LanguageParam,
  QueryParam,
  TrackingIdParam,
  ContextParam,
  CountryParam,
} from '../../commerce-api-params.js';
import {baseRequest} from '../../common/request.js';

export type QuerySuggestRequest = BaseParam &
  TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  QueryParam;

export const getQuerySuggestRequestOptions = (req: QuerySuggestRequest) => {
  return {
    ...baseRequest(req, 'search/querySuggest'),
    requestParams: prepareRequestParams(req),
  };
};

const prepareRequestParams = (req: QuerySuggestRequest) => {
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
