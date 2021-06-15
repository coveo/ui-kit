import {Engine} from '../../app/headless-engine';
import {
  ConfigurationSection,
  RedirectionSection,
} from '../../state/state-sections';
import {configuration, redirection} from '../../app/reducers';
import {buildController, Controller} from '../controller/headless-controller';
import {loadReducerError} from '../../utils/errors';
import {logTriggerRedirect} from '../../features/redirection/redirection-analytics-actions';

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
  redirectTo: string | null;
}

/**
 * Creates a `RedirectionTrigger` controller instance.
 *
 * @param engine - The headless engine.
 * @returns A `RedirectionTrigger` controller instance.
 * */
export function buildRedirectionTrigger(
  engine: Engine<RedirectionSection & ConfigurationSection>
): RedirectionTrigger {
  if (!loadRedirectionReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  let previousRedirectTo = '';

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const hasChanged = previousRedirectTo !== this.state.redirectTo;
        console.log('prev value', previousRedirectTo);
        console.log('current controller state', this.state.redirectTo);
        previousRedirectTo = this.state.redirectTo!;
        console.log('updated prev value', previousRedirectTo);

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
        redirectTo: engine.state.redirection.redirectTo,
      };
    },
  };
}

function loadRedirectionReducers(
  engine: Engine<object>
): engine is Engine<RedirectionSection & ConfigurationSection> {
  engine.addReducers({configuration, redirection});
  return true;
}
