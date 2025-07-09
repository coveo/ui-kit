import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {logNotifyTrigger} from '../../../features/triggers/insight-trigger-analytics-actions.js';
import {
  buildCoreNotifyTrigger,
  type NotifyTrigger,
  type NotifyTriggerState,
} from '../../core/triggers/headless-core-notify-trigger.js';

export type {NotifyTrigger, NotifyTriggerState};

/**
 * Creates an insight `NotifyTrigger` controller instance.
 *
 * @param engine - The insight engine.
 * @returns A `NotifyTrigger` controller instance.
 *
 * @group Controllers
 * @category NotifyTrigger
 * */
export function buildNotifyTrigger(engine: InsightEngine): NotifyTrigger {
  return buildCoreNotifyTrigger(engine, {
    options: {
      logNotifyTriggerActionCreator: logNotifyTrigger,
    },
  });
}
