import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  RecentQueriesList,
  RecentQueriesListProps,
  buildRecentQueriesList,
} from './headless-recent-queries-list.js';

export * from './headless-recent-queries-list.js';

/**
 * @internal
 */
export const defineRecentQueriesList = (
  props?: RecentQueriesListProps
): ControllerDefinitionWithoutProps<SearchEngine, RecentQueriesList> => ({
  build: (engine) => buildRecentQueriesList(engine, props),
});
