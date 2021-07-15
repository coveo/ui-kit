import {search} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
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
export function buildQueryError(engine: SearchEngine): QueryError {
  if (!loadQueryErrorReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine.state;

  return {
    ...controller,

    get state() {
      return {
        hasError: getState().search.error !== null,
        error: getState().search.error,
      };
    },
  };
}

function loadQueryErrorReducers(
  engine: SearchEngine
): engine is SearchEngine<SearchSection> {
  engine.addReducers({search});
  return true;
}
