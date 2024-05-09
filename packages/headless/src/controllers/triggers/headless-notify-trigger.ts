import {SearchEngine} from '../../app/search-engine/search-engine';
import {logNotifyTrigger} from '../../features/triggers/trigger-analytics-actions';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice';
import {TriggerSection} from '../../state/state-sections';
import {arrayEqual} from '../../utils/compare-utils';
import {loadReducerError} from '../../utils/errors';
import {buildController} from '../controller/headless-controller';
import {NotifyTrigger} from '../core/triggers/headless-core-notify-trigger';

/**
 * Creates a `NotifyTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `NotifyTrigger` controller instance.
 * */
export function buildNotifyTrigger(engine: SearchEngine): NotifyTrigger {
  if (!loadNotifyTriggerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => engine.state;

  let previousNotifications = getState().triggers.notifications;

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const hasChanged = !arrayEqual(
          previousNotifications,
          this.state.notifications
        );
        previousNotifications = this.state.notifications;

        if (hasChanged) {
          listener();
          dispatch(logNotifyTrigger());
        }
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        notifications: getState().triggers.notifications,
      };
    },
  };
}

function loadNotifyTriggerReducers(
  engine: SearchEngine
): engine is SearchEngine<TriggerSection> {
  engine.addReducers({triggers});
  return true;
}
