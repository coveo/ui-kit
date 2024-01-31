import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {
  RecentQueriesList,
  RecentQueriesListProps,
  buildRecentQueriesList,
} from './headless-recent-queries-list';

export * from './headless-recent-queries-list';

export interface RecentQueriesListDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, RecentQueriesList> {}

/**
 * Defines a `RecentQueriesList` controller instance.
 *
 * @param props - The configurable `RecentQueriesList` properties.
 * @returns The `RecentQueriesList` controller definition.
 * */
export function defineRecentQueriesList(
  props?: RecentQueriesListProps
): RecentQueriesListDefinition {
  return {
    build: (engine) => buildRecentQueriesList(engine, props),
  };
}
