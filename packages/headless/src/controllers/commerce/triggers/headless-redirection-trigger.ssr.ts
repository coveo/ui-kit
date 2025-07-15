import type {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import type {RedirectionTrigger} from '../../core/triggers/headless-core-redirection-trigger.js';
import {buildRedirectionTrigger} from './headless-redirection-trigger.js';

export type {RedirectionTriggerState} from '../../core/triggers/headless-core-redirection-trigger.js';
export type {RedirectionTrigger};
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
