import {BaseParam} from '../../../platform-service-params';
import {
  ClientIdParam,
  CurrencyParam,
  LanguageParam,
  QueryParam,
  TrackingIdParam,
  ContextParam,
  CountryParam,
} from '../../commerce-api-params';
import {baseRequest} from '../../common/request';

export type QuerySuggestRequest = BaseParam &
  TrackingIdParam &
  LanguageParam &
  CountryParam &
  CurrencyParam &
  ClientIdParam &
  ContextParam &
  QueryParam;

export const buildQuerySuggestRequest = (req: QuerySuggestRequest) => {
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
