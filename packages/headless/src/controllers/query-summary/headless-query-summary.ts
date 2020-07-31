import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';

/**
 * The QuerySummary component can display information about the current range of results (e.g., "Results
 * 1-10 of 123").
 *
 * When the query does not match any items, the QuerySummary component can instead return information to the end users.
 */
export type QuerySummary = ReturnType<typeof buildQuerySummary>;
/** The state relevant to the `QuerySummary` controller.*/
export type QuerySummaryState = QuerySummary['state'];

export const buildQuerySummary = (engine: Engine) => {
  const controller = buildController(engine);

  const durationInSeconds = () => {
    const state = engine.state;
    const inSeconds = state.search.duration / 1000;
    return Math.round((inSeconds + Number.EPSILON) * 100) / 100;
  };

  return {
    ...controller,

    /**
     * @returns The state of the `QuerySummary` controller.
     */
    get state() {
      const state = engine.state;
      return {
        firstResult: state.pagination.firstResult + 1,
        lastResult:
          state.pagination.firstResult + state.search.response.results.length,
        total: state.pagination.totalCountFiltered,
        query: state.search.queryExecuted,
        hasQuery: state.search.queryExecuted !== '',
        hasDuration: state.search.duration !== 0,
        hasResults: state.search.response.results.length !== 0,
        durationInMilliseconds: state.search.duration,
        durationInSeconds: durationInSeconds(),
      };
    },
  };
};
