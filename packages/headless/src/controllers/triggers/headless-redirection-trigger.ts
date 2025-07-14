import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {logTriggerRedirect} from '../../features/triggers/trigger-analytics-actions.js';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice.js';
import type {TriggerSection} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {buildController} from '../controller/headless-controller.js';
import type {RedirectionTrigger} from '../core/triggers/headless-core-redirection-trigger.js';

/**
 * Creates a `RedirectionTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `RedirectionTrigger` controller instance.
 *
 * @group Controllers
 * @category RedirectionTrigger
 * */
export function buildRedirectionTrigger(
  engine: SearchEngine
): RedirectionTrigger {
  if (!loadRedirectionReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => engine.state;

  let previousRedirectTo = getState().triggers.redirectTo;

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const hasChanged = previousRedirectTo !== this.state.redirectTo;
        previousRedirectTo = this.state.redirectTo;

        if (hasChanged && this.state.redirectTo) {
          listener();
          dispatch(logTriggerRedirect());
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
  engine: SearchEngine
): engine is SearchEngine<TriggerSection> {
  engine.addReducers({triggers});
  return true;
}
