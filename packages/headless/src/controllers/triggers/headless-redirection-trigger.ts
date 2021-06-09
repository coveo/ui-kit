import {Schema, StringValue} from '@coveo/bueno';
import {Engine} from '../../app/headless-engine';
import {
  ConfigurationSection,
  RedirectionSection,
} from '../../state/state-sections';
import {configuration, redirection} from '../../app/reducers';
import {buildController, Controller} from '../controller/headless-controller';
import {loadReducerError} from '../../utils/errors';
import {
  validateInitialState,
  validateOptions,
} from '../../utils/validate-payload';

export interface RedirectionInitialState {
  /**
   * The initial url used for the redirection.
   **/
  redirectTo?: string;
}

export interface RedirectionOptions {
  /**
   * The function used to handle whenever the `Redirection` controller's state's `redirectTo` value changes.
   */
  function: Function;
}

export interface RedirectionProps {
  /**
   * The options for the `Redirection` controller.
   */
  options?: RedirectionOptions;
  /**
   * The initial state that should be applied to the `Redirection` controller.
   */
  initialState?: RedirectionInitialState;
}

const optionsSchema = new Schema({
  function: new Function(),
});

const initialStateSchema = new Schema({
  redirectTo: new StringValue({emptyAllowed: true}),
});
/**
 * The `Redirection` controller handles redirection actions.
 */
export interface Redirection extends Controller {
  /**
   * the state of the Redirection controller.
   */
  state: RedirectionState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `Pager` controller.
 */
export interface RedirectionState {
  /**
   * The url used for the redirection.
   */
  redirectTo?: string;
}

/**
 * Creates a `Redirection` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Redirection` properties.
 * @returns A `Redirection` controller instance.
 * */
export function buildRedirection(
  engine: Engine<object>,
  props: RedirectionProps = {}
): Redirection {
  if (!loadRedirectionReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildRedirection'
  ) as Required<RedirectionOptions>;
  const initialState = validateInitialState(
    engine,
    initialStateSchema,
    props.initialState,
    'buildRedirection'
  );
  const redirectTo = initialState.redirectTo;

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
