import {buildRedirectionTrigger} from '../../../../controllers/commerce/triggers/headless-redirection-trigger.js';
import type {
  RedirectionTrigger,
  RedirectionTriggerState,
} from '../../../../controllers/core/triggers/headless-core-redirection-trigger.js';
import type {SearchOnlyControllerDefinitionWithoutProps} from '../../types/controllers.js';

export type {RedirectionTrigger, RedirectionTriggerState};

export interface RedirectionTriggerDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<RedirectionTrigger> {}

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
