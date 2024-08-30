import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {logNotifyTrigger} from '../../../features/triggers/insight-trigger-analytics-actions';
import {
  buildCoreNotifyTrigger,
  NotifyTrigger,
  NotifyTriggerState,
} from '../../core/triggers/headless-core-notify-trigger';

export type {NotifyTrigger, NotifyTriggerState};

/**
 * Creates an insight `NotifyTrigger` controller instance.
 *
 * @param engine - The insight engine.
 * @returns A `NotifyTrigger` controller instance.
 * */
export function buildNotifyTrigger(engine: InsightEngine): NotifyTrigger {
  const dispatch = engine.dispatch;
  const notifyTrigger = buildCoreNotifyTrigger(engine);

  return {
    ...notifyTrigger,

    get state() {
      return notifyTrigger.state;
    },

    subscribe(listener: () => void) {
      return notifyTrigger.subscribe(() => {
        listener();
        dispatch(logNotifyTrigger());
      });
    },
  };
}
