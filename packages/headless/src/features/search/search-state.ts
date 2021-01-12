import {SearchAPIErrorWithStatusCode} from '../../api/search/search-api-error-response';
import {Result} from '../../api/search/search/result';
import {SearchResponseSuccess} from '../../api/search/search/search-response';

export interface SearchState {
  /** The search response. For a full description, refer to {@link https://docs.coveo.com/en/13/cloud-v2-api-reference/search-api#operation/searchUsingPost}*/
  response: SearchResponseSuccess;
  /**
   * The time it took to execute the request against the Coveo platform.
   */
  duration: number;
  /**
   * The query (searchbox content) that was executed against the Coveo platform.
   */
  queryExecuted: string;
  /**
   * The error returned by the Coveo platform while executing the search request, if any. `null` otherwise.
   */
  error: SearchAPIErrorWithStatusCode | null;
  /**
   * Specifies if the query was automatically corrected by Headless.
   * This happens when there is no result returned by the API for a particular mispelling.
   */
  automaticallyCorrected: boolean;
  /**
   * `true` if the search request is currently being executed against the Coveo platform, `false` otherwise.
   */
  isLoading: boolean;
  /**
   * The list of results.
   */
  results: Result[];
}

export function getSearchInitialState(): SearchState {
  return {
    response: {
      results: [],
      searchUid: '',
      totalCountFiltered: 0,
      facets: [],
      queryCorrections: [],
    },
    duration: 0,
    queryExecuted: '',
    error: null,
    automaticallyCorrected: false,
    isLoading: false,
    results: [],
  };
}
