import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RecentQueriesList,
  RecentQueriesListProps,
  buildRecentQueriesList,
} from './headless-recent-queries-list';

export * from './headless-recent-queries-list';

/**
 * Defines a `RecentQueriesList` controller instance.
 *
 * @param props - The configurable `RecentQueriesList` properties.
 * @returns The `RecentQueriesList` controller definition.
 * */
export function defineRecentQueriesList(
  props?: RecentQueriesListProps
): ControllerDefinitionWithoutProps<SearchEngine, RecentQueriesList> {
  return {
    build: (engine) => buildRecentQueriesList(engine, props),
  };
}
