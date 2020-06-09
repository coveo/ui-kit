import {QuerySuggestCompletion} from './api/search/query-suggest/query-suggest-response';
import {QuerySetState} from './features/query-set/query-set-slice';
import {SearchState} from './features/search/search-slice';
import {NumberOfResultsState} from './features/number-of-results/number-of-results-slice';
import {SortCriteriaState} from './features/sort-criteria/sort-criteria-slice';

export interface HeadlessState {
  /**
   * The expressions that constitute the current query.
   */
  query: QueryState;
  /**
   * The set of basic query expressions.
   */
  querySet: QuerySetState;
  /**
   * The global headless engine configuration.
   */
  configuration: ConfigurationState;
  /**
   * The number of results to request.
   */
  numberOfResults: NumberOfResultsState;
  /**
   * The URL redirection triggered by the preprocessed query.
   */
  redirection: RedirectionState;
  /**
   * The query suggestions returned by Coveo ML.
   */
  querySuggest: QuerySuggestSet;
  /**
   * The information related to the search endpoint.
   */
  search: SearchState;
  /**
   * The sort criteria to use with the search query. For more information, refer to {@link https://docs.coveo.com/en/1461/cloud-v2-developers/query-parameters#RestQueryParameters-sortCriteria}
   */
  sortCriteria: SortCriteriaState;
}

export interface ConfigurationState {
  /**
   * The unique identifier of the target Coveo Cloud organization (e.g., `mycoveocloudorganizationg8tp8wu3`)
   */
  organizationId: string;
  /**
   * The access token to use to authenticate requests against the Coveo Cloud endpoints. Typically, this will be an API key or search token that grants the privileges to execute queries and push usage analytics data in the target Coveo Cloud organization.
   */
  accessToken: string;
  /**
   * The global headless engine Search API configuration.
   */
  search: {
    /**
     * The Search API base URL to use (e.g., https://globalplatform.cloud.coveo.com/rest/search/v2).
     */
    searchApiBaseUrl: string;
  };
}

export interface QueryState {
  /**
   * The basic query expression (e.g., `acme tornado seeds`).
   */
  q: string;
}

export interface RedirectionState {
  /**
   * The URL to redirect the user to.
   */
  redirectTo: string | null;
}

export type QuerySuggestSet = Record<string, QuerySuggestState | undefined>;

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
   * The number of query suggestions requested from Coveo ML (e.g., `3`).
   */
  count: number;
  /**
   * The unique identifier of the current query suggestion request.
   */
  currentRequestId: string;
}
