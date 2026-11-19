import type {SearchEngine} from '@coveo/headless';
import type {NotifyTrigger} from '@coveo/headless';
import {buildNotifyTrigger} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export type {NotifyTrigger, NotifyTriggerState} from '@coveo/headless';

export interface NotifyTriggerDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  NotifyTrigger
> {}

/**
 * Defines a `NotifyTrigger` controller instance.
 * @group Definers
 *
 * @returns The `NotifyTrigger` controller definition.
 * */
export function defineNotifyTrigger(): NotifyTriggerDefinition {
  return {
    build: (engine) => buildNotifyTrigger(engine),
  };
}
