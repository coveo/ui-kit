import {Engine} from '../../app/headless-engine';
import {SearchSection} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';

/**
 * `QueryError` controller allows to retrieve information about the current error returned by the search API, if any.
 */
export type QueryError = ReturnType<typeof buildQueryError>;
/**
 * A scoped and simplified part of the headless state that is relevant to the `QueryError` controller.
 */
export type QueryErrorState = QueryError['state'];

export const buildQueryError = (engine: Engine<SearchSection>) => {
  const controller = buildController(engine);

  return {
    ...controller,
    /**
     * The state of the `QueryError` controller.
     */
    get state() {
      return {
        /**
         * `true` if there is an error for the last executed query and `false` otherwise.
         */
        hasError: engine.state.search.error !== null,
        /**
         * The current error for the last executed query, or `null` if none is present.
         */
        error: engine.state.search.error,
      };
    },
  };
};
