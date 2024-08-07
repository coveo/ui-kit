import {SharedControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {QueryTrigger} from '../../core/triggers/headless-core-query-trigger';
import {buildQueryTrigger} from './headless-query-trigger';

export type {QueryTriggerState} from '../../core/triggers/headless-core-query-trigger';
export type {QueryTrigger};
export interface QueryTriggerDefinition
  extends SharedControllerDefinitionWithoutProps<QueryTrigger> {}

/**
 * Defines a `NotifyTrigger` controller instance.
 *
 * @returns The `NotifyTrigger` controller definition.
 *
 * @internal
 */
export function defineQueryTrigger(): QueryTriggerDefinition {
  return {
    search: true,
    listing: true,
    build: (engine) => buildQueryTrigger(engine),
  };
}
