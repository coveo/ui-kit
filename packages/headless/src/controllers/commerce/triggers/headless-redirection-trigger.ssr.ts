import {SharedControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {RedirectionTrigger} from '../../core/triggers/headless-core-redirection-trigger';
import {buildRedirectionTrigger} from './headless-redirection-trigger';

export type {RedirectionTriggerState} from '../../core/triggers/headless-core-redirection-trigger';
export type {RedirectionTrigger};
export interface RedirectionTriggerDefinition
  extends SharedControllerDefinitionWithoutProps<RedirectionTrigger> {}

/**
 * Defines a `NotifyTrigger` controller instance.
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
