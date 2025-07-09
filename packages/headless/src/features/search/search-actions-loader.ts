import type {AsyncThunkAction} from '@reduxjs/toolkit';
import type {
  AsyncThunkSearchOptions,
  SearchAPIClient,
} from '../../api/search/search-api-client.js';
import type {AsyncThunkOptions} from '../../app/async-thunk-options.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments.js';
import {searchReducer as search} from '../../features/search/search-slice.js';
import type {InstantResultSection} from '../../state/state-sections.js';
import type {LegacySearchAction} from '../analytics/analytics-utils.js';
import type {
  FetchInstantResultsActionCreatorPayload,
  FetchInstantResultsThunkReturn,
} from '../instant-results/instant-results-actions.js';
import {
  type ExecuteSearchThunkReturn,
  executeSearch,
  fetchFacetValues,
  fetchInstantResults,
  fetchMoreResults,
  fetchPage,
} from './legacy/search-actions.js';
import type {StateNeededByExecuteSearch} from './legacy/search-actions-thunk-processor.js';

/**
 * The search action creators.
 *
 * @group Actions
 * @category Search
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
 *
 * @group Actions
 * @category Search
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
