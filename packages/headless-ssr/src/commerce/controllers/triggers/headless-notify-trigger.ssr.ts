import {buildNotifyTrigger} from '@coveo/headless/commerce';
import type {NotifyTrigger, NotifyTriggerState} from '@coveo/headless/commerce';
import type {SearchAndListingControllerDefinitionWithoutProps} from '../../types/controller-definitions.js';

export type {NotifyTrigger, NotifyTriggerState};

export type NotifyTriggerDefinition =
  SearchAndListingControllerDefinitionWithoutProps<NotifyTrigger>;

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
