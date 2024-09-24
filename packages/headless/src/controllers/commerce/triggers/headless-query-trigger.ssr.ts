import {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {QueryTrigger} from '../../core/triggers/headless-core-query-trigger.js';
import {buildQueryTrigger} from './headless-query-trigger.js';

export type {QueryTriggerState} from '../../core/triggers/headless-core-query-trigger.js';
export type {QueryTrigger};
export interface QueryTriggerDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<QueryTrigger> {}

/**
 * Defines the `NotifyTrigger` controller for the purpose of server-side rendering.
 *
 * @returns The `NotifyTrigger` controller definition.
 *
 * @internal
 */
export function defineQueryTrigger(): QueryTriggerDefinition {
  return {
    search: true,
    build: (engine) => buildQueryTrigger(engine),
  };
}
