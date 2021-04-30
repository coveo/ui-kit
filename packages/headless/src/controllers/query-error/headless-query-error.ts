import {Engine} from '../../app/headless-engine';
import {search} from '../../app/reducers';
import {SearchSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {ErrorPayload} from '../controller/error-payload';
import {buildController, Controller} from '../controller/headless-controller';

/**
 * The `QueryError` controller allows to retrieve information about the current error returned by the search API, if any.
 */
export interface QueryError extends Controller {
  /**
   * The state of the `QueryError` controller.
   */
  state: QueryErrorState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `QueryError` controller.
 */
export interface QueryErrorState {
  /**
   * `true` if there is an error for the last executed query and `false` otherwise.
   */
  hasError: boolean;

  /**
   * The current error for the last executed query, or `null` if none is present.
   */
  error: ErrorPayload | null;
}

/**
 * Creates a `QueryError` controller instance.
 *
 * @param engine - The headless engine.
 */
export function buildQueryError(engine: Engine<object>): QueryError {
  if (!loadQueryErrorReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine.state;

  return {
    subscribe: controller.subscribe,

    get state() {
      return {
        hasError: getState().search.error !== null,
        error: getState().search.error,
      };
    },
  };
}

function loadQueryErrorReducers(
  engine: Engine<object>
): engine is Engine<SearchSection> {
  engine.addReducers({search});
  return true;
}
