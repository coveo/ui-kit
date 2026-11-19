import type {SearchEngine} from '@coveo/headless';
import {
  buildRecentQueriesList,
  type RecentQueriesList,
  type RecentQueriesListProps,
} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type RecentQueriesList,
  type RecentQueriesListInitialState,
  type RecentQueriesListOptions,
  type RecentQueriesListProps,
  type RecentQueriesState,
} from '@coveo/headless';

export interface RecentQueriesListDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  RecentQueriesList
> {}

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
