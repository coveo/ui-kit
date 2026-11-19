import type {SearchEngine} from '@coveo/headless';
import type {RedirectionTrigger} from '@coveo/headless';
import {buildRedirectionTrigger} from '@coveo/headless';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export type {RedirectionTrigger, RedirectionTriggerState} from '@coveo/headless';

export interface RedirectionTriggerDefinition extends ControllerDefinitionWithoutProps<
  SearchEngine,
  RedirectionTrigger
> {}

/**
 * Defines a `RedirectionTrigger` controller instance.
 * @group Definers
 *
 * @returns The `RedirectionTrigger` controller definition.
 * */
export function defineRedirectionTrigger(): RedirectionTriggerDefinition {
  return {
    build: (engine) => buildRedirectionTrigger(engine),
  };
}
