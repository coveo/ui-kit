import {SearchAndStandaloneControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {QueryTrigger} from '../../core/triggers/headless-core-query-trigger.js';
import {buildQueryTrigger} from './headless-query-trigger.js';

export type {QueryTriggerState} from '../../core/triggers/headless-core-query-trigger.js';
export type {QueryTrigger};
export interface QueryTriggerDefinition
  extends SearchAndStandaloneControllerDefinitionWithoutProps<QueryTrigger> {}

/**
 * Defines the `QueryTrigger` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @returns The `QueryTrigger` controller definition.
 */
export function defineQueryTrigger(): QueryTriggerDefinition {
  return {
    search: true,
    standalone: true,
    build: (engine) => buildQueryTrigger(engine),
  };
}
