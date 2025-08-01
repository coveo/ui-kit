import {buildNotifyTrigger} from '../../../../controllers/commerce/triggers/headless-notify-trigger.js';
import type {
  NotifyTrigger,
  NotifyTriggerState,
} from '../../../../controllers/core/triggers/headless-core-notify-trigger.js';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {NotifyTrigger, NotifyTriggerState};

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
