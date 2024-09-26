import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {QuerySummary, buildQuerySummary} from './headless-query-summary.js';

export * from './headless-query-summary.js';

export interface QuerySummaryDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, QuerySummary> {}

/**
 * Defines a `QuerySummary` controller instance.
 *
 * @returns The `QuerySummary` controller definition.
 * */
export function defineQuerySummary(): QuerySummaryDefinition {
  return {
    build: (engine) => buildQuerySummary(engine),
  };
}
