import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RecentQueriesList,
  RecentQueriesListProps,
  buildRecentQueriesList,
} from './headless-recent-queries-list';

export type {
  RecentQueriesListInitialState,
  RecentQueriesList,
  RecentQueriesState,
  RecentQueriesListProps,
  RecentQueriesListOptions,
} from './headless-recent-queries-list';

/**
 * @internal
 */
export const defineRecentQueriesList = (
  props?: RecentQueriesListProps
): ControllerDefinitionWithoutProps<SearchEngine, RecentQueriesList> => ({
  build: (engine) => buildRecentQueriesList(engine, props),
});
