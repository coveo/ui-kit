import {UniversalControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {
  RecentQueriesList,
  RecentQueriesListProps,
  buildRecentQueriesList,
} from './headless-recent-queries-list.js';

export type {
  RecentQueriesState,
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
} from './headless-recent-queries-list.js';
export type {RecentQueriesList, RecentQueriesListProps};

export interface RecentQueriesListDefinition
  extends UniversalControllerDefinitionWithoutProps<RecentQueriesList> {}

/**
 * Defines the `RecentQueriesList` controller for the purpose of server-side rendering.
 * @group Definers
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
    standalone: true,
    build: (engine) => buildRecentQueriesList(engine, props),
  };
}
