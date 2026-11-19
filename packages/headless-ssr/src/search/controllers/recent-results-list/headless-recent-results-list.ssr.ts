import type {SearchEngine} from '@coveo/headless';
import {
  buildRecentResultsList,
  type RecentResultsList,
  type RecentResultsListProps,
} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {
  type RecentResultsListProps,
  type RecentResultsListInitialState,
  type RecentResultsListOptions,
  type RecentResultsList,
  type RecentResultsState,
} from '@coveo/headless';

export interface RecentResultsListDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  RecentResultsList
> {}

/**
 * Defines a `RecentResultsList` controller instance.
 * @group Definers
 *
 * @param props - The configurable `RecentResultsList` properties.
 * @returns The `RecentResultsList` controller definition.
 * */
export function defineRecentResultsList(
  props?: RecentResultsListProps
): RecentResultsListDefinition {
  return {
    build: (engine) => buildRecentResultsList(engine, props),
  };
}
