import type {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import type {QueryTrigger} from '../../core/triggers/headless-core-query-trigger.js';
import {buildQueryTrigger} from './headless-query-trigger.js';

export type {QueryTriggerState} from '../../core/triggers/headless-core-query-trigger.js';
export type {QueryTrigger};
export interface QueryTriggerDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<QueryTrigger> {}

/**
 * Defines the `QueryTrigger` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @returns The `QueryTrigger` controller definition.
 */
export function defineQueryTrigger(): QueryTriggerDefinition {
  return {
    search: true,
    build: (engine) => buildQueryTrigger(engine),
  };
}
