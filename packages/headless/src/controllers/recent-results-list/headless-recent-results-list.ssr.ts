import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RecentResultsList,
  RecentResultsListProps,
  buildRecentResultsList,
} from './headless-recent-results-list';

export * from './headless-recent-results-list';

/**
 * Defines a `RecentResultsList` controller instance.
 *
 * @param props - The configurable `RecentResultsList` properties.
 * @returns The `RecentResultsList` controller definition.
 * */
export function defineRecentResultsList(
  props?: RecentResultsListProps
): ControllerDefinitionWithoutProps<SearchEngine, RecentResultsList> {
  return {
    build: (engine) => buildRecentResultsList(engine, props),
  };
}
