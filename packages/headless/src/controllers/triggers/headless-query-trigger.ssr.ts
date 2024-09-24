import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {QueryTrigger} from '../core/triggers/headless-core-query-trigger.js';
import {buildQueryTrigger} from './headless-query-trigger.js';

export type {
  QueryTrigger,
  QueryTriggerState,
} from '../core/triggers/headless-core-query-trigger.js';

export * from './headless-query-trigger.js';

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
