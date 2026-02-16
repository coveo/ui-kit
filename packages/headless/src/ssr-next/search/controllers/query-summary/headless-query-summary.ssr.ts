import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  buildQuerySummary,
  type QuerySummary,
} from '../../../../controllers/query-summary/headless-query-summary.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export * from '../../../../controllers/query-summary/headless-query-summary.js';

export interface QuerySummaryDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, QuerySummary> {}

/**
 * Defines a `QuerySummary` controller instance.
 * @group Definers
 *
 * @returns The `QuerySummary` controller definition.
 * */
export function defineQuerySummary(): QuerySummaryDefinition {
  return {
    build: (engine) => buildQuerySummary(engine),
  };
}
