import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildRecentQueriesList,
  type RecentQueriesList,
  type RecentQueriesListProps,
} from './headless-recent-queries-list.js';

export * from './headless-recent-queries-list.js';

export interface RecentQueriesListDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, RecentQueriesList> {}

/**
 * Defines a `RecentQueriesList` controller instance.
 * @group Definers
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
