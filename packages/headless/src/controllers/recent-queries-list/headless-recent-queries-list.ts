import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
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
  RecentQueriesList,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesListProps,
  RecentQueriesState,
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
  engine: SearchEngine | FrankensteinEngine,
  props?: RecentQueriesListProps
): RecentQueriesList {
  const searchEngine = ensureSearchEngine(engine);
  const coreController = buildCoreRecentQueriesList(searchEngine, props);
  const {dispatch} = searchEngine;

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
