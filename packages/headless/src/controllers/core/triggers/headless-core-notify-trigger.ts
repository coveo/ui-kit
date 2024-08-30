import {CoreEngine} from '../../../app/engine';
import {logNotifyTrigger} from '../../../features/triggers/insight-trigger-analytics-actions';
import {triggerReducer as triggers} from '../../../features/triggers/triggers-slice';
import {TriggerSection} from '../../../state/state-sections';
import {arrayEqual} from '../../../utils/compare-utils';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

/**
 * The `NotifyTrigger` controller handles notify triggers. A [Notify trigger](https://docs.coveo.com/en/3413#notify) query pipeline rule lets you define a message to be displayed to the end user when a certain condition is met.
 */
export interface NotifyTrigger extends Controller {
  /**
   * The state of the `NotifyTrigger` controller.
   */
  state: NotifyTriggerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `NotifyTrigger` controller.
 */
export interface NotifyTriggerState {
  /**
   * The notifications to display to the user after receiving notification triggers.
   */
  notifications: string[];
}

/**
 * Creates a core `NotifyTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `NotifyTrigger` controller instance.
 */
export function buildCoreNotifyTrigger(engine: CoreEngine): NotifyTrigger {
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
  engine: CoreEngine
): engine is CoreEngine<TriggerSection> {
  engine.addReducers({triggers});
  return true;
}
