import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {commerceTriggersReducer as triggers} from '../../../features/commerce/triggers/triggers-slice.js';
import type {TriggerSection} from '../../../state/state-sections.js';
import {arrayEqual} from '../../../utils/compare-utils.js';
import {loadReducerError} from '../../../utils/errors.js';
import {buildController} from '../../controller/headless-controller.js';
import type {NotifyTrigger} from '../../core/triggers/headless-core-notify-trigger.js';

/**
 * Creates a `NotifyTrigger` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `NotifyTrigger` controller instance.
 *
 * @group Buildable controllers
 * @category NotifyTrigger
 * */
export function buildNotifyTrigger(engine: CommerceEngine): NotifyTrigger {
  if (!loadNotifyTriggerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine[stateKey];

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
  engine: CommerceEngine
): engine is CommerceEngine<TriggerSection> {
  engine.addReducers({triggers});
  return true;
}
