import {buildQueryTrigger} from '../../../../controllers/commerce/triggers/headless-query-trigger.js';
import type {QueryTrigger} from '../../../../controllers/core/triggers/headless-core-query-trigger.js';
import type {SearchOnlyControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {QueryTriggerState} from '../../../../controllers/core/triggers/headless-core-query-trigger.js';
export type {QueryTrigger};
export type QueryTriggerDefinition =
  SearchOnlyControllerDefinitionWithoutProps<QueryTrigger>;

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
