import {SharedControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
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
  extends SharedControllerDefinitionWithoutProps<RecentQueriesList> {}

/**
 * Defines the `RecentQueriesList` controller for the purpose of server-side rendering.
 *
 * @param props - The configuration `RecentQueriesList` properties.
 * @returns The `RecentQueriesList` controller definition.
 *
 * @internal
 */
export function defineRecentQueriesList(
  props: RecentQueriesListProps = {}
): RecentQueriesListDefinition {
  return {
    search: true,
    listing: true,
    build: (engine) => buildRecentQueriesList(engine, props),
  };
}
