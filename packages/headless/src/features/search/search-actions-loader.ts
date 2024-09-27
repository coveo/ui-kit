import {AsyncThunkAction} from '@reduxjs/toolkit';
import {
  AsyncThunkSearchOptions,
  SearchAPIClient,
} from '../../api/search/search-api-client.js';
import {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import {InstantResultSection} from '../../state/state-sections.js';
import {LegacySearchAction} from '../analytics/analytics-utils.js';
import {
  FetchInstantResultsActionCreatorPayload,
  FetchInstantResultsThunkReturn,
} from '../instant-results/instant-results-actions.js';
import {StateNeededByExecuteSearch} from './legacy/search-actions-thunk-processor.js';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
  fetchMoreResults,
  fetchFacetValues,
  fetchPage,
  fetchInstantResults,
} from './legacy/search-actions.js';

/**
 * The search action creators.
 */
export interface SearchActionCreators {
  /**
   * Creates an action that executes a search query.
   *
   * @example
   *
   * ```js
   * const {logInterfaceLoad} = loadSearchAnalyticsActions(engine);
   * const {executeSearch} = loadSearchActions(engine);
   *
   * engine.dispatch(executeSearch({legacy: interfaceLoad()}))
   * ```
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  executeSearch(
    analyticsSearchAction: LegacySearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    LegacySearchAction,
    AsyncThunkOptions<
      StateNeededByExecuteSearch,
      ClientThunkExtraArguments<SearchAPIClient>
    >
  >;

  /**
   * Creates an action that fetches more results.
   *
   * @returns A dispatchable action.
   */
  fetchMoreResults(): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    void,
    AsyncThunkOptions<
      StateNeededByExecuteSearch,
      ClientThunkExtraArguments<SearchAPIClient>
    >
  >;

  /**
   * Creates an action that only fetches facet values without affecting the rest of the state.
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  fetchFacetValues(
    analyticsSearchAction: LegacySearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    LegacySearchAction,
    AsyncThunkOptions<
      StateNeededByExecuteSearch,
      ClientThunkExtraArguments<SearchAPIClient>
    >
  >;

  /**
   * Creates an action that executes a search query to fetch a new page of results.
   *
   * @example
   *
   * ```js
   * const {logPagerNext} = loadSearchAnalyticsActions(engine);
   * const {fetchPage} = loadSearchActions(engine);
   *
   * engine.dispatch(fetchPage(logPagerNext()));
   * ```
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  fetchPage(
    analyticsSearchAction: LegacySearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    LegacySearchAction,
    AsyncThunkOptions<
      StateNeededByExecuteSearch,
      ClientThunkExtraArguments<SearchAPIClient>
    >
  >;

  /**
   * Creates an action that fetches instant results.
   *
   * @param options - The options for fetching instant results.
   * @returns A dispatchable action.
   */
  fetchInstantResults(
    options: FetchInstantResultsActionCreatorPayload
  ): AsyncThunkAction<
    FetchInstantResultsThunkReturn,
    FetchInstantResultsActionCreatorPayload,
    AsyncThunkSearchOptions<StateNeededByExecuteSearch & InstantResultSection>
  >;
}

/**
 * Loads the `search` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadSearchActions(engine: SearchEngine): SearchActionCreators {
  engine.addReducers({search});
  return {
    executeSearch,
    fetchMoreResults,
    fetchFacetValues,
    fetchPage,
    fetchInstantResults,
  };
}
