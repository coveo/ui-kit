import type {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response.js';
import {getAdvancedSearchQueriesInitialState} from '../advanced-search-queries/advanced-search-queries-state.js';
import {
  type LegacySearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {getQueryInitialState} from '../query/query-state.js';

export const logFetchMoreResults = (): LegacySearchAction =>
  makeAnalyticsAction('search/logFetchMoreResults', (client) =>
    client.makeFetchMoreResults()
  );

export const logQueryError = (
  error: SearchAPIErrorWithStatusCode
): LegacySearchAction =>
  makeAnalyticsAction('search/queryError', (client, state) =>
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
