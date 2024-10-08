import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  RecentResultsList,
  RecentResultsListProps,
  buildRecentResultsList,
} from './headless-recent-results-list.js';

export * from './headless-recent-results-list.js';

export interface RecentResultsListDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, RecentResultsList> {}

/**
 * Defines a `RecentResultsList` controller instance.
 *
 * @param props - The configurable `RecentResultsList` properties.
 * @returns The `RecentResultsList` controller definition.
 * */
export function defineRecentResultsList(
  props?: RecentResultsListProps
): RecentResultsListDefinition {
  return {
    build: (engine) => buildRecentResultsList(engine, props),
  };
}
