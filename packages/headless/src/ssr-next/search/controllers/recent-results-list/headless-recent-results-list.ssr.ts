import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildRecentResultsList,
  type RecentResultsList,
  type RecentResultsListProps,
} from '../../../../controllers/recent-results-list/headless-recent-results-list.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/recent-results-list/headless-recent-results-list.js';

export interface RecentResultsListDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, RecentResultsList> {}

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
