import {QuerySuggestCompletion} from './api/search/query-suggest/query-suggest-response';
import {SearchState} from './features/search/search-slice';
import {SearchParametersState} from './search-parameters-state';
import {StateWithHistory} from 'redux-undo';
import {DidYouMeanState} from './features/did-you-mean/did-you-mean-slice';
import {SearchAPIErrorWithStatusCode} from './api/search/search-api-error-response';

export interface SearchPageState extends SearchParametersState {
  /**
   * The global headless engine configuration.
   */
  configuration: ConfigurationState;
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
   * DidYouMean allows to retrieve query corrections from the index related to end user mispelling.
   */
  didYouMean: DidYouMeanState;
  /**
   * The information related to the history navigation.
   */
  history: StateWithHistory<SearchParametersState>;
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
  /**
   * Specifies if analytics tracking should be enabled. By default analytics events are tracked.
   */
  analyticsEnabled: boolean;
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
  error: SearchAPIErrorWithStatusCode | null;
}
