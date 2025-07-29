import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import type {QueryTrigger} from '../../../../controllers/core/triggers/headless-core-query-trigger.js';
import {buildQueryTrigger} from '../../../../controllers/triggers/headless-query-trigger.js';
import type {ControllerDefinitionWithoutProps} from '../../../common/types/controllers.js';

export type {
  QueryTrigger,
  QueryTriggerState,
} from '../../../../controllers/core/triggers/headless-core-query-trigger.js';

export * from '../../../../controllers/triggers/headless-query-trigger.js';

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
