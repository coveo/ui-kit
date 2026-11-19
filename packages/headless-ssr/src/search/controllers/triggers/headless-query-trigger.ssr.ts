import type {SearchEngine} from '@coveo/headless';
import type {QueryTrigger} from '@coveo/headless';
import {buildQueryTrigger} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export type {QueryTrigger, QueryTriggerState} from '@coveo/headless';

export interface QueryTriggerDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  QueryTrigger
> {}

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
