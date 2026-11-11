import {
  buildRecentQueriesList,
  type RecentQueriesList,
  type RecentQueriesListInitialState,
  type RecentQueriesListOptions as CoreRecentQueriesListOptions,
  type RecentQueriesListProps as CoreRecentQueriesListProps,
  type RecentQueriesState,
} from '../../../../controllers/commerce/recent-queries-list/headless-recent-queries-list.js';
import type {UniversalControllerDefinition} from '../../types/controller-definitions.js';

export type {RecentQueriesList, RecentQueriesListInitialState, RecentQueriesState};

/**
 * The `RecentQueriesList` controller options. Whether the search of a selected query fills `results`
 * rather than `products` comes from the `enableResults` option of the engine definition.
 */
export type RecentQueriesListOptions = Omit<CoreRecentQueriesListOptions, 'enableResults'>;

export interface RecentQueriesListProps extends Omit<CoreRecentQueriesListProps, 'options'> {
  /**
   * The `RecentQueriesList` controller options.
   */
  options?: RecentQueriesListOptions;
}

export type RecentQueriesListDefinition = UniversalControllerDefinition<RecentQueriesList>;

/**
 * Defines the `RecentQueriesList` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @param props - The static `RecentQueriesList` properties.
 * @returns The `RecentQueriesList` controller definition.
 */
export function defineRecentQueriesList(
  props: RecentQueriesListProps = {}
): RecentQueriesListDefinition {
  return {
    search: true,
    listing: true,
    standalone: true,
    build: (engine, {enableResults}) =>
      buildRecentQueriesList(engine, {
        ...props,
        options: {...props.options, enableResults: enableResults.search},
      }),
  };
}
