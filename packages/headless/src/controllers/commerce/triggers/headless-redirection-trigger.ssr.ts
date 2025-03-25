import {StandaloneOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {RedirectionTrigger} from '../../core/triggers/headless-core-redirection-trigger.js';
import {buildRedirectionTrigger} from './headless-redirection-trigger.js';

export type {RedirectionTriggerState} from '../../core/triggers/headless-core-redirection-trigger.js';
export type {RedirectionTrigger};
export interface RedirectionTriggerDefinition
  extends StandaloneOnlyControllerDefinitionWithoutProps<RedirectionTrigger> {}

/**
 * Defines the `RedirectionTrigger` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @returns The `RedirectionTrigger` controller definition.
 */
export function defineRedirectionTrigger(): RedirectionTriggerDefinition {
  return {
    standalone: true,
    build: (engine) => buildRedirectionTrigger(engine),
  };
}
