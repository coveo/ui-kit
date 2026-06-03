import type {QuerySuggestCompletion} from '../../api/search/query-suggest/query-suggest-response.js';
import type {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response.js';

export interface QuerySuggestState {
  /**
   * The unique identifier of the query suggest entity (for example, `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  id: string;
  /**
   * The current list of query suggestions.
   */
  completions: QuerySuggestCompletion[];
  /**
   * The query suggest response id.
   */
  responseId: string;
  /**
   * A history of the queries for which query suggestions have been received
   */
  partialQueries: string[];
  /**
   * The number of query suggestions requested from Coveo ML (for example, `3`).
   */
  count: number;
  /**
   * The unique identifier of the current query suggestion request.
   */
  currentRequestId: string;
  /**
   * The error returned by the Coveo platform while executing the query suggestion request, if any. `null` otherwise.
   */
  error: SearchAPIErrorWithStatusCode | null;
  /**
   * `true` if the query suggest request is currently being executed against the Coveo platform, `false` otherwise.
   */
  isLoading: boolean;
}

export type QuerySuggestSet = Record<string, QuerySuggestState | undefined>;

export const getQuerySuggestSetInitialState: () => QuerySuggestSet = () => ({});
