import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {SearchPageEvents} from '../../features/analytics/search-action-cause.js';
import {
  logClearRecentQueries,
  logRecentQueryClick,
} from '../../features/recent-queries/recent-queries-analytics-actions.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {
  buildCoreRecentQueriesList,
  type RecentQueriesList,
  type RecentQueriesListInitialState,
  type RecentQueriesListOptions,
  type RecentQueriesListProps,
  type RecentQueriesState,
} from '../core/recent-queries-list/headless-core-recent-queries-list.js';

export type {
  RecentQueriesListProps,
  RecentQueriesListOptions,
  RecentQueriesList,
  RecentQueriesState,
  RecentQueriesListInitialState,
};

/**
 * Creates a `RecentQueriesList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configuration `RecentQueriesList` properties.
 * @returns A `RecentQueriesList` controller instance.
 *
 * @group Controllers
 * @category RecentQueriesList
 * */
export function buildRecentQueriesList(
  engine: SearchEngine,
  props?: RecentQueriesListProps
): RecentQueriesList {
  const coreController = buildCoreRecentQueriesList(engine, props);
  const {dispatch} = engine;

  return {
    ...coreController,

    get state() {
      return coreController.state;
    },

    clear() {
      dispatch(logClearRecentQueries());
      coreController.clear();
    },

    executeRecentQuery(index: number) {
      coreController.executeRecentQuery(index);
      dispatch(
        executeSearch({
          legacy: logRecentQueryClick(),
          next: {actionCause: SearchPageEvents.recentQueriesClick},
        })
      );
    },
  };
}
