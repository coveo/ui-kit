import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RecentResultsList,
  RecentResultsListProps,
  buildRecentResultsList,
} from './headless-recent-results-list';

export * from './headless-recent-results-list';

/**
 * @alpha
 */
export const defineRecentResultsList = (
  props?: RecentResultsListProps
): ControllerDefinitionWithoutProps<SearchEngine, RecentResultsList> => ({
  build: (engine) => buildRecentResultsList(engine, props),
});
