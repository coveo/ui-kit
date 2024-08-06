import {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {
  RecentQueriesList,
  RecentQueriesListProps,
  buildRecentQueriesList,
} from './headless-recent-queries-list';

export type {
  RecentQueriesState,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
} from './headless-recent-queries-list';
export type {RecentQueriesList, RecentQueriesListProps};

export interface RecentQueriesListDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<RecentQueriesList> {}

/**
 * Defines a `RecentQueriesList` controller instance.
 *
 * @returns The `RecentQueriesList` controller definition.
 *
 * @internal
 */
export function defineRecentQueriesList(
  props: RecentQueriesListProps = {}
): RecentQueriesListDefinition {
  return {
    search: true,
    build: (engine) => buildRecentQueriesList(engine, props),
  };
}
