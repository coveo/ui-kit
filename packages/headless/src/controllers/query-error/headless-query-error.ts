import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';

/**
 * `QueryError` controller allows to retrieve information about the current error returned by the search API, if any.
 */
export type QueryError = ReturnType<typeof buildQueryError>;
export type QueryErrorState = QueryError['state'];

export const buildQueryError = (engine: Engine) => {
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
};
