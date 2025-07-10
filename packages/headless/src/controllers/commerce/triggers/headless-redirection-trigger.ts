import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {commerceTriggersReducer as triggers} from '../../../features/commerce/triggers/triggers-slice.js';
import type {TriggerSection} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {buildController} from '../../controller/headless-controller.js';
import type {RedirectionTrigger} from '../../core/triggers/headless-core-redirection-trigger.js';

/**
 * Creates a `RedirectionTrigger` controller instance.
 *
 * **Note:** The `StandaloneSearchBox` controller has a built-in mechanism to leverage query pipeline redirect triggers.
 * Consequently, the `RedirectionTrigger` controller is only useful to implement non-standard use cases, such as
 * handling redirect triggers on a full search page.
 *
 * @param engine - The headless commerce engine.
 * @returns A `RedirectionTrigger` controller instance.
 *
 * @group Buildable controllers
 * @category RedirectionTrigger
 * */
export function buildRedirectionTrigger(
  engine: CommerceEngine
): RedirectionTrigger {
  if (!loadRedirectionReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);

  const getState = () => engine[stateKey];

  let previousRedirectTo = getState().triggers.redirectTo;

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const hasChanged = previousRedirectTo !== this.state.redirectTo;
        previousRedirectTo = this.state.redirectTo;

        if (hasChanged && this.state.redirectTo) {
          listener();
        }
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        redirectTo: getState().triggers.redirectTo,
      };
    },
  };
}

function loadRedirectionReducers(
  engine: CommerceEngine
): engine is CommerceEngine<TriggerSection> {
  engine.addReducers({triggers});
  return true;
}
