import {buildQueryTrigger} from '../../../../controllers/commerce/triggers/headless-query-trigger.js';
import type {QueryTrigger} from '../../../../controllers/core/triggers/headless-core-query-trigger.js';
import type {SearchOnlyControllerDefinition} from '../../types/controller-definitions.js';

export type {QueryTriggerState} from '../../../../controllers/core/triggers/headless-core-query-trigger.js';
export type {QueryTrigger};
export type QueryTriggerDefinition = SearchOnlyControllerDefinition<QueryTrigger>;

/**
 * Defines the `QueryTrigger` controller for the purpose of server-side rendering.
 * @group Definers
 * @returns The `QueryTrigger` controller definition. The search it triggers fills `results` rather
 *  than `products` when the `enableResults` option of the engine definition says so.
 */
export function defineQueryTrigger(): QueryTriggerDefinition {
  return {
    search: true,
    build: (engine, {enableResults}) =>
      buildQueryTrigger(engine, {enableResults: enableResults.search}),
  };
}
