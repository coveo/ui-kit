import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {
  buildQuerySummary,
  type QuerySummary,
} from './headless-query-summary.js';

export * from './headless-query-summary.js';

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
