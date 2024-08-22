import {SearchAndListingControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common';
import {NotifyTrigger} from '../../core/triggers/headless-core-notify-trigger';
import {buildNotifyTrigger} from './headless-notify-trigger';

export type {NotifyTriggerState} from '../../core/triggers/headless-core-notify-trigger';
export type {NotifyTrigger};
export interface NotifyTriggerDefinition
  extends SearchAndListingControllerDefinitionWithoutProps<NotifyTrigger> {}

/**
 * Defines the `NotifyTrigger` controller for the purpose of server-side rendering.
 *
 * @returns The `NotifyTrigger` controller definition.
 *
 * @internal
 */
export function defineNotifyTrigger(): NotifyTriggerDefinition {
  return {
    search: true,
    listing: true,
    build: (engine) => buildNotifyTrigger(engine),
  };
}
