import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';
import {getQueryInitialState} from '../query/query-state';

export const logFetchMoreResults = makeInsightAnalyticsAction(
  'search/logFetchMoreResults',
  AnalyticsType.Search,
  (client) => client.logFetchMoreResults()
);

export const logQueryError = (error: SearchAPIErrorWithStatusCode) =>
  makeInsightAnalyticsAction(
    'search/queryError',
    AnalyticsType.Search,
    (client, state) =>
      client.logQueryError({
        query: state.query?.q || getQueryInitialState().q,
        aq: '',
        cq: '',
        dq: '',
        errorType: error.type,
        errorMessage: error.message,
      })
  )();
