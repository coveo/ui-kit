import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import type {ControllerDefinitionWithoutProps} from '../../app/ssr-engine/types/common.js';
import type {NotifyTrigger} from '../core/triggers/headless-core-notify-trigger.js';
import {buildNotifyTrigger} from './headless-notify-trigger.js';

export type {
  NotifyTrigger,
  NotifyTriggerState,
} from '../core/triggers/headless-core-notify-trigger.js';

export interface NotifyTriggerDefinition
  extends ControllerDefinitionWithoutProps<SearchEngine, NotifyTrigger> {}

/**
 * Defines a `NotifyTrigger` controller instance.
 * @group Definers
 *
 * @returns The `NotifyTrigger` controller definition.
 * */
export function defineNotifyTrigger(): NotifyTriggerDefinition {
  return {
    build: (engine) => buildNotifyTrigger(engine),
  };
}
