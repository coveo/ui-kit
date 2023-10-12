import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response.js';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state.js';
import {
  makeAnalyticsAction,
  AnalyticsType,
  SearchAction,
} from '../analytics/analytics-utils.js';
import {getQueryInitialState} from '../query/query-state.js';

export const logFetchMoreResults = (): SearchAction =>
  makeAnalyticsAction(
    'search/logFetchMoreResults',
    AnalyticsType.Search,
    (client) => client.makeFetchMoreResults()
  );

export const logQueryError = (
  error: SearchAPIErrorWithStatusCode
): SearchAction =>
  makeAnalyticsAction(
    'search/queryError',
    AnalyticsType.Search,
    (client, state) =>
      client.makeQueryError({
        query: state.query?.q || getQueryInitialState().q,
        aq:
          state.advancedSearchQueries?.aq ||
          getAdvancedSearchQueriesInitialState().aq,
        cq:
          state.advancedSearchQueries?.cq ||
          getAdvancedSearchQueriesInitialState().cq,
        dq:
          state.advancedSearchQueries?.dq ||
          getAdvancedSearchQueriesInitialState().dq,
        errorType: error.type,
        errorMessage: error.message,
      })
  );
