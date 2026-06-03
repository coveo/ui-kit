import type {CoreEngine} from '../../../app/engine.js';
import type {
  InsightAction,
  LegacySearchAction,
} from '../../../features/analytics/analytics-utils.js';
import {triggerReducer as triggers} from '../../../features/triggers/triggers-slice.js';
import type {TriggerSection} from '../../../state/state-sections.js';
import {arrayEqual} from '../../../utils/compare-utils.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

/**
 * The `NotifyTrigger` controller handles notify triggers. A [Notify trigger](https://docs.coveo.com/en/3413#notify) query pipeline rule lets you define a message to be displayed to the end user when a certain condition is met.
 *
 * Example: [notify-trigger.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/triggers/notify-trigger.fn.tsx)
 *
 * @group Controllers
 * @category NotifyTrigger
 */
export interface NotifyTrigger extends Controller {
  /**
   * The state of the `NotifyTrigger` controller.
   */
  state: NotifyTriggerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `NotifyTrigger` controller.
 *
 * @group Controllers
 * @category NotifyTrigger
 */
export interface NotifyTriggerState {
  /**
   * The notifications to display to the user after receiving notification triggers.
   */
  notifications: string[];
}

interface NotifyTriggerProps {
  options: NotifyTriggerOptions;
}

interface NotifyTriggerOptions {
  logNotifyTriggerActionCreator: () => InsightAction | LegacySearchAction;
}

/**
 * Creates a core `NotifyTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `NotifyTrigger` controller instance.
 *
 * @group Controllers
 * @category NotifyTrigger
 */
export function buildCoreNotifyTrigger(
  engine: CoreEngine,
  props: NotifyTriggerProps
): NotifyTrigger {
  const logNotifyTrigger = props.options.logNotifyTriggerActionCreator;

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
