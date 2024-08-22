import {SearchAndListingControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {RedirectionTrigger} from '../../core/triggers/headless-core-redirection-trigger';
import {buildRedirectionTrigger} from './headless-redirection-trigger';

export type {RedirectionTriggerState} from '../../core/triggers/headless-core-redirection-trigger';
export type {RedirectionTrigger};
export interface RedirectionTriggerDefinition
  extends SearchAndListingControllerDefinitionWithoutProps<RedirectionTrigger> {}

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
    listing: true,
    build: (engine) => buildRedirectionTrigger(engine),
  };
}
