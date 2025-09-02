import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import type {NotifyTrigger} from '../../../../controllers/core/triggers/headless-core-notify-trigger.js';
import {buildNotifyTrigger} from '../../../../controllers/triggers/headless-notify-trigger.js';
import type {ControllerDefinitionWithoutProps} from '../../types/controller-definition.js';

export type {
  NotifyTrigger,
  NotifyTriggerState,
} from '../../../../controllers/core/triggers/headless-core-notify-trigger.js';

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
