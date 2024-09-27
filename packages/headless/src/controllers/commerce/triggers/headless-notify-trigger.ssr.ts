import {SearchOnlyControllerDefinitionWithoutProps} from '../../../app/commerce-ssr-engine/types/common.js';
import {NotifyTrigger} from '../../core/triggers/headless-core-notify-trigger.js';
import {buildNotifyTrigger} from './headless-notify-trigger.js';

export type {NotifyTriggerState} from '../../core/triggers/headless-core-notify-trigger.js';
export type {NotifyTrigger};
export interface NotifyTriggerDefinition
  extends SearchOnlyControllerDefinitionWithoutProps<NotifyTrigger> {}

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
    build: (engine) => buildNotifyTrigger(engine),
  };
}
