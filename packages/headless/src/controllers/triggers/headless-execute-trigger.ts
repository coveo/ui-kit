import {TriggerSection} from '../../state/state-sections';
import {triggers} from '../../app/reducers';
import {buildController, Controller} from '../controller/headless-controller';
import {loadReducerError} from '../../utils/errors';
import {logTriggerExecute} from '../../features/triggers/trigger-analytics-actions';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {ExecuteTriggerParams} from '../../api/search/trigger';

/**
 * The `ExecuteTrigger` controller handles execute trigger actions.
 */
export interface ExecuteTrigger extends Controller {
  /**
   * The state of the `ExecuteTrigger` controller.
   */
  state: ExecuteTriggerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `ExecuteTrigger` controller.
 */
export interface ExecuteTriggerState {
  /**
   * The name of the function to be executed.
   */
  functionName: string;

  /**
   * The parameters of the function to be executed.
   */
  params: ExecuteTriggerParams;
}

/**
 * Creates a `ExecuteTrigger` controller instance. An execute trigger is configured in the Administration console,
 * and used to execute a function in the browser when a certain condition is met.
 *
 *
 * @param engine - The headless engine.
 * @returns A `RedirectionTrigger` controller instance.
 * */
export function buildExecuteTrigger(engine: SearchEngine): ExecuteTrigger {
  if (!loadExecuteTriggerReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  const getState = () => engine.state;

  let previousName = getState().triggers.execute.functionName;
  let previousParams = getState().triggers.execute.params;

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const hasChanged =
          previousName !== this.state.functionName ||
          previousParams !== this.state.params;

        previousName = this.state.functionName;
        previousParams = this.state.params;

        if (hasChanged && this.state.functionName) {
          listener();
          dispatch(logTriggerExecute());
        }
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        functionName: getState().triggers.execute.functionName,
        params: getState().triggers.execute.params,
      };
    },
  };
}

function loadExecuteTriggerReducers(
  engine: SearchEngine
): engine is SearchEngine<TriggerSection> {
  engine.addReducers({triggers});
  return true;
}
