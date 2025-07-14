import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import type {QueryTrigger} from '../core/triggers/headless-core-query-trigger.js';
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
 * @group Definers
 *
 * @returns The `QueryTrigger` controller definition.
 * */
export function defineQueryTrigger(): QueryTriggerDefinition {
  return {
    build: (engine) => buildQueryTrigger(engine),
  };
}
