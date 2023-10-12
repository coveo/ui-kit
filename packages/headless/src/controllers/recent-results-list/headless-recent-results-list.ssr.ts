import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  RecentResultsList,
  RecentResultsListProps,
  buildRecentResultsList,
} from './headless-recent-results-list.js';

export * from './headless-recent-results-list.js';

/**
 * @internal
 */
export const defineRecentResultsList = (
  props?: RecentResultsListProps
): ControllerDefinitionWithoutProps<SearchEngine, RecentResultsList> => ({
  build: (engine) => buildRecentResultsList(engine, props),
});
