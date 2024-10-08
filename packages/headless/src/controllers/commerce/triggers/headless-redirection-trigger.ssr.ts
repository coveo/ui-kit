import {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {RedirectionTrigger} from '../../core/triggers/headless-core-redirection-trigger.js';
import {buildRedirectionTrigger} from './headless-redirection-trigger.js';

export type {RedirectionTriggerState} from '../../core/triggers/headless-core-redirection-trigger.js';
export type {RedirectionTrigger};
export interface RedirectionTriggerDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<RedirectionTrigger> {}

/**
 * Defines the `NotifyTrigger` controller for the purpose of server-side rendering.
 *
 * @returns The `NotifyTrigger` controller definition.
 *
 * @internal
 */
export function defineRedirectionTrigger(): RedirectionTriggerDefinition {
  return {
    search: true,
    build: (engine) => buildRedirectionTrigger(engine),
  };
}
