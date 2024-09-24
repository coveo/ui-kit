import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import {NotifyTrigger} from '../core/triggers/headless-core-notify-trigger.js';
import {buildNotifyTrigger} from './headless-notify-trigger.js';

export {buildNotifyTrigger} from './headless-notify-trigger.js';
export type {
  NotifyTrigger,
  NotifyTriggerState,
} from '../core/triggers/headless-core-notify-trigger.js';

export interface NotifyTriggerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, NotifyTrigger> {}

/**
 * Defines a `NotifyTrigger` controller instance.
 *
 * @returns The `NotifyTrigger` controller definition.
 * */
export function defineNotifyTrigger(): NotifyTriggerDefinition {
  return {
    build: (engine) => buildNotifyTrigger(engine),
  };
}
