import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {logNotifyTrigger} from '../../features/triggers/trigger-analytics-actions.js';
import {
  buildCoreNotifyTrigger,
  NotifyTrigger,
  NotifyTriggerState,
} from '../core/triggers/headless-core-notify-trigger.js';

export type {NotifyTrigger, NotifyTriggerState};

/**
 * Creates a `NotifyTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `NotifyTrigger` controller instance.
 * */
export function buildNotifyTrigger(engine: SearchEngine): NotifyTrigger {
  return buildCoreNotifyTrigger(engine, {
    options: {
      logNotifyTriggerActionCreator: logNotifyTrigger,
    },
  });
}
