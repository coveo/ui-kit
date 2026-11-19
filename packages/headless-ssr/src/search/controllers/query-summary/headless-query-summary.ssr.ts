import type {SearchEngine} from '@coveo/headless';
import {buildQuerySummary, type QuerySummary} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {type QuerySummary, type QuerySummaryState} from '@coveo/headless';

export interface QuerySummaryDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  QuerySummary
> {}

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
