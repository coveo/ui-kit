import {Engine} from '../../app/headless-engine';
import {SearchSection} from '../../state/state-sections';
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
  error: QueryErrorPayload | null;
}

export interface QueryErrorPayload {
  /**
   * The error HTTP status code.
   */
  statusCode: number;

  /**
   * The error message.
   */
  message: string;

  /**
   * The error type.
   */
  type: string;
}

/**
 * Creates a `QueryError` controller instance.
 *
 * @param engine - The headless engine.
 */
export function buildQueryError(engine: Engine<SearchSection>): QueryError {
  const controller = buildController(engine);

  return {
    ...controller,

    get state() {
      return {
        hasError: engine.state.search.error !== null,
        error: engine.state.search.error,
      };
    },
  };
}
