import type {SearchEngine} from '@coveo/headless';
import {buildExecuteTrigger, type ExecuteTrigger} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export {type ExecuteTrigger, type ExecuteTriggerState} from '@coveo/headless';

export interface ExecuteTriggerDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  ExecuteTrigger
> {}

/**
 * Defines an `ExecuteTrigger` controller instance.
 * @group Definers
 *
 * @returns The `ExecuteTrigger` controller definition.
 * */
export function defineExecuteTrigger(): ExecuteTriggerDefinition {
  return {
    build: (engine) => buildExecuteTrigger(engine),
  };
}
