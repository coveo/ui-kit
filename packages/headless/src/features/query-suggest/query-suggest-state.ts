import {QuerySuggestCompletion} from '../../api/search/query-suggest/query-suggest-response';
import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';

export interface QuerySuggestState {
  /**
   * The unique identifier of the query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  id: string;
  /**
   * The current list of query suggestions.
   */
  completions: QuerySuggestCompletion[];
  /**
   * The partial basic query expression for which query suggestions were requested (e.g., `cov`).
   */
  q: string;
  /**
   * A history of the queries for which query suggestions have been received
   */
  partialQueries: string[];
  /**
   * The number of query suggestions requested from Coveo ML (e.g., `3`).
   */
  count: number;
  /**
   * The unique identifier of the current query suggestion request.
   */
  currentRequestId: string;
  error: SearchAPIErrorWithStatusCode | null;
}

export type QuerySuggestSet = Record<string, QuerySuggestState | undefined>;

export const getQuerySuggestInitialState: () => QuerySuggestState = () => ({
  id: '',
  completions: [],
  count: 5,
  q: '',
  currentRequestId: '',
  error: null,
  partialQueries: [],
});
