import {
  buildRecentQueriesList,
  type RecentQueriesList,
  type RecentQueriesListInitialState,
  type RecentQueriesListOptions,
  type RecentQueriesListProps,
  type RecentQueriesState,
} from '../../../../controllers/commerce/recent-queries-list/headless-recent-queries-list.js';
import type {NonRecommendationControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {
  RecentQueriesListInitialState,
  RecentQueriesListOptions,
  RecentQueriesState,
  RecentQueriesList,
  RecentQueriesListProps,
};

export type RecentQueriesListDefinition =
  NonRecommendationControllerDefinitionWithoutProps<RecentQueriesList>;

/**
 * Defines the `RecentQueriesList` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @param props - The configuration `RecentQueriesList` properties.
 * @returns The `RecentQueriesList` controller definition.
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
