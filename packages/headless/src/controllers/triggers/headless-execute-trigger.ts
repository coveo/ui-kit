import {SearchEngine} from '../../app/search-engine/search-engine';
import {logTriggerExecute} from '../../features/triggers/trigger-analytics-actions';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice';
import {FunctionExecutionTrigger} from '../../features/triggers/triggers-state';
import {TriggerSection} from '../../state/state-sections';
import {arrayEqual} from '../../utils/compare-utils';
import {loadReducerError} from '../../utils/errors';
import {buildController, Controller} from '../controller/headless-controller';

/**
 * The `ExecuteTrigger` controller handles Execute triggers from the query response. An [Execute trigger](https://docs.coveo.com/en/3413#execute) query pipeline rule lets you define a custom JavaScript function to be executed in the frontend when a certain condition is met.
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
   * The functions to be executed.
   */
  executions: FunctionExecutionTrigger[];
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

  let previousExecutions = getState().triggers.executions;

  return {
    ...controller,

    subscribe(listener: () => void) {
      const strictListener = () => {
        const hasChanged = !arrayEqual(
          this.state.executions,
          previousExecutions,
          (first, second) =>
            first.functionName === second.functionName &&
            arrayEqual(first.params, second.params)
        );

        previousExecutions = this.state.executions;

        if (hasChanged && this.state.executions.length) {
          listener();
          dispatch(logTriggerExecute());
        }
      };
      strictListener();
      return engine.subscribe(strictListener);
    },

    get state() {
      return {
        executions: getState().triggers.executions,
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
