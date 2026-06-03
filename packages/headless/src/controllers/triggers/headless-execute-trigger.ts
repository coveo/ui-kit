import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {logTriggerExecute} from '../../features/triggers/trigger-analytics-actions.js';
import {triggerReducer as triggers} from '../../features/triggers/triggers-slice.js';
import type {FunctionExecutionTrigger} from '../../features/triggers/triggers-state.js';
import type {TriggerSection} from '../../state/state-sections.js';
import {arrayEqual} from '../../utils/compare-utils.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../controller/headless-controller.js';

/**
 * The `ExecuteTrigger` controller handles Execute triggers from the query response. An [Execute trigger](https://docs.coveo.com/en/3413#execute) query pipeline rule lets you define a custom JavaScript function to be executed in the frontend when a certain condition is met.
 *
 * Examples:
 * - [execute-trigger.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/triggers/execute-trigger.tsx)
 * - [execute-trigger.class.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/triggers/execute-trigger.class.tsx)
 *
 * @group Controllers
 * @category ExecuteTrigger
 */
export interface ExecuteTrigger extends Controller {
  /**
   * The state of the `ExecuteTrigger` controller.
   */
  state: ExecuteTriggerState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `ExecuteTrigger` controller.
 *
 * @group Controllers
 * @category ExecuteTrigger
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
 *
 * @group Controllers
 * @category ExecuteTrigger
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
