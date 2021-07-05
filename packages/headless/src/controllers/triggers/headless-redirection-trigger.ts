import {TriggerSection} from '../../state/state-sections';
import {triggers} from '../../app/reducers';
import {buildController, Controller} from '../controller/headless-controller';
import {loadReducerError} from '../../utils/errors';
import {logTriggerRedirect} from '../../features/triggers/trigger-analytics-actions';
import {SearchEngine} from '../../app/search-engine/search-engine';

/**
 * The `RedirectionTrigger` controller handles redirection actions.
 */
export interface RedirectionTrigger extends Controller {
  /**
   * the state of the `RedirectionTrigger` controller.
   */
  state: RedirectionTriggerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `RedirectionTrigger` controller.
 */
export interface RedirectionTriggerState {
  /**
   * The url used for the redirection.
   */
  redirectTo: string;
}

/**
 * Creates a `RedirectionTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `RedirectionTrigger` controller instance.
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
