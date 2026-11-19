import {buildRedirectionTrigger} from '@coveo/headless/commerce';
import type {RedirectionTrigger, RedirectionTriggerState} from '@coveo/headless/commerce';
import type {SearchOnlyControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {RedirectionTrigger, RedirectionTriggerState};

export type RedirectionTriggerDefinition =
  SearchOnlyControllerDefinitionWithoutProps<RedirectionTrigger>;

/**
 * Defines the `RedirectionTrigger` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @returns The `RedirectionTrigger` controller definition.
 */
export function defineRedirectionTrigger(): RedirectionTriggerDefinition {
  return {
    search: true,
    build: (engine) => buildRedirectionTrigger(engine),
  };
}
