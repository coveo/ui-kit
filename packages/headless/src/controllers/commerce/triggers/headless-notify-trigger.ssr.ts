import type {SearchAndListingControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import type {NotifyTrigger} from '../../core/triggers/headless-core-notify-trigger.js';
import {buildNotifyTrigger} from './headless-notify-trigger.js';

export type {NotifyTriggerState} from '../../core/triggers/headless-core-notify-trigger.js';
export type {NotifyTrigger};
export interface NotifyTriggerDefinition
  extends SearchAndListingControllerDefinitionWithoutProps<NotifyTrigger> {}

/**
 * Defines the `NotifyTrigger` controller for the purpose of server-side rendering.
 * @group Definers
 *
 * @returns The `NotifyTrigger` controller definition.
 */
export function defineNotifyTrigger(): NotifyTriggerDefinition {
  return {
    listing: true,
    search: true,
    build: (engine) => buildNotifyTrigger(engine),
  };
}
