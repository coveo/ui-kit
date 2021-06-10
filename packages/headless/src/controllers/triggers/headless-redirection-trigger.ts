import {Schema, Value} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {
  ConfigurationSection,
  RedirectionSection,
} from '../../state/state-sections';
import {configuration, redirection} from '../../app/reducers';
import {buildController, Controller} from '../controller/headless-controller';
import {loadReducerError} from '../../utils/errors';
import {validateOptions} from '../../utils/validate-payload';
import {logTriggerRedirect} from '../../features/redirection/redirection-analytics-actions';

export interface RedirectionTriggerOptions {
  /**
   * The function used to handle whenever the `RedirectionTrigger` controller's state's `redirectTo` value changes.
   */
  onRedirect(): void;
}

export interface RedirectionTriggerProps {
  /**
   * The options for the `RedirectionTrigger` controller.
   */
  options?: RedirectionTriggerOptions;
}

const optionsSchema = new Schema({
  onRedirect: new Value({required: true}),
});

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
 * @param props - The configurable `Redirection` properties.
 * @returns A `Redirection` controller instance.
 * */
export function buildRedirection(
  engine: Engine<object>,
  props: RedirectionTriggerProps = {}
): RedirectionTrigger {
  if (!loadRedirectionReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildRedirectionTrigger'
  ) as Required<RedirectionTriggerOptions>;

  const redirectTo = engine.state.redirection.redirectTo!;
  const {onRedirect} = options;
  if (redirectTo !== '') {
    onRedirect();
    dispatch(logTriggerRedirect);
  }

  return {
    ...controller,

    get state() {
      return {
        redirectTo,
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
