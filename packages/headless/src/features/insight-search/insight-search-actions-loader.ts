import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {insightSearch} from '../../app/reducers';
import {InsightEngine} from '../../insight.index';
import {SearchAction} from '../analytics/analytics-utils';
import {
  insightExecuteSearch,
  InsightExecuteSearchThunkReturn,
  insightFetchFacetValues,
  insightFetchMoreResults,
  StateNeededByExecuteSearch,
} from './insight-search-actions';

export interface InsightSearchActionCreaters {
  /**
   * Creates an action that executes a search query.
   *
   * @example
   *
   * ```js
   * const {logInterfaceLoad} = loadSearchAnalyticsActions(engine);
   * const {insightExecuteSearch} = loadInsightSearchActions(engine);
   *
   * engine.dispatch(insightExecuteSearch(interfaceLoad()));
   * @param analyticsSearchAction  - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  insightExecuteSearch(
    analyticsSearchAction: SearchAction
  ): AsyncThunkAction<
    InsightExecuteSearchThunkReturn,
    SearchAction,
    AsyncThunkInsightOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Creates an action that fetches more results.
   *
   * @returns A dispatchable action.
   */
  insightFetchMoreResults(): AsyncThunkAction<
    InsightExecuteSearchThunkReturn,
    void,
    AsyncThunkInsightOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Creates an action that only fetches facet values without affecting the rest of the state.
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  insightFetchFacetValues(
    analyticsSearchAction: SearchAction
  ): AsyncThunkAction<
    InsightExecuteSearchThunkReturn,
    SearchAction,
    AsyncThunkInsightOptions<StateNeededByExecuteSearch>
  >;
}

export function loadInsightSearchActions(
  engine: InsightEngine
): InsightSearchActionCreaters {
  engine.addReducers({insightSearch});
  return {
    insightExecuteSearch,
    insightFetchMoreResults,
    insightFetchFacetValues,
  };
}
