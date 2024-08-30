import {SearchEngine} from '../../app/search-engine/search-engine';
import {logNotifyTrigger} from '../../features/triggers/trigger-analytics-actions';
import {
  buildCoreNotifyTrigger,
  NotifyTrigger,
  NotifyTriggerState,
} from '../core/triggers/headless-core-notify-trigger';

export type {NotifyTrigger, NotifyTriggerState};

/**
 * Creates a `NotifyTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `NotifyTrigger` controller instance.
 * */
export function buildNotifyTrigger(engine: SearchEngine): NotifyTrigger {
  const {dispatch} = engine;
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
