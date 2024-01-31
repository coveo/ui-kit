import {SearchEngine} from '../../app/search-engine/search-engine';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common';
import {QueryTrigger, buildQueryTrigger} from './headless-query-trigger';

export * from './headless-query-trigger';

export interface QueryTriggerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, QueryTrigger> {}

/**
 * Defines a `QueryTrigger` controller instance.
 *
 * @returns The `QueryTrigger` controller definition.
 * */
export function defineQueryTrigger(): QueryTriggerDefinition {
  return {
    build: (engine) => buildQueryTrigger(engine),
  };
}
