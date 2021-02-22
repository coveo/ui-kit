import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state';
import {makeAnalyticsAction, AnalyticsType} from '../analytics/analytics-utils';
import {getQueryInitialState} from '../query/query-state';

export const logFetchMoreResults = makeAnalyticsAction(
  'search/logFetchMoreResults',
  AnalyticsType.Search,
  (client) => client.logFetchMoreResults()
);

export const logQueryError = (error: SearchAPIErrorWithStatusCode) =>
  makeAnalyticsAction(
    'search/queryError',
    AnalyticsType.Search,
    (client, state) =>
      client.logQueryError({
        query: state.query?.q || getQueryInitialState().q,
        aq:
          state.advancedSearchQueries?.aq ||
          getAdvancedSearchQueriesInitialState().aq,
        cq:
          state.advancedSearchQueries?.cq ||
          getAdvancedSearchQueriesInitialState().cq,
        // TODO: add dq when its added to advanced queries
        dq: '',
        errorType: error.type,
        errorMessage: error.message,
      })
  )();
