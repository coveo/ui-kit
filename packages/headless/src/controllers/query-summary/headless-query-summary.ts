import {Engine} from '../../app/headless-engine';
import {PaginationSection, SearchSection} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';

export type QuerySummary = ReturnType<typeof buildQuerySummary>;
/** The state relevant to the `QuerySummary` controller.*/
export type QuerySummaryState = QuerySummary['state'];

/**
 * The QuerySummary component can display information about the current range of results (e.g., "Results
 * 1-10 of 123").
 *
 * When the query does not match any items, the QuerySummary component can instead return information to the end users.
 */
export const buildQuerySummary = (
  engine: Engine<SearchSection & PaginationSection>
) => {
  const controller = buildController(engine);

  const durationInSeconds = () => {
    const state = engine.state;
    const inSeconds = state.search.duration / 1000;
    return Math.round((inSeconds + Number.EPSILON) * 100) / 100;
  };

  return {
    ...controller,

    /**
     * @returns {QuerySummaryState} The state of the `QuerySummary` controller.
     */
    get state() {
      const state = engine.state;
      return {
        /**
         * The 1-based index of the first search result returned for the current page.
         */
        firstResult: state.pagination.firstResult + 1,
        /**
         * The 1-based index of the last search result returned for the current page.
         */
        lastResult: state.pagination.firstResult + state.search.results.length,
        /**
         * The total count of results available.
         */
        total: state.pagination.totalCountFiltered,
        /**
         * The query that was last executed (the content of the searchbox).
         */
        query: state.search.queryExecuted,
        /**
         * Determines if an empty query was executed.
         */
        hasQuery: state.search.queryExecuted !== '',
        /**
         * Determines if a query execution time is available.
         */
        hasDuration: state.search.duration !== 0,
        /**
         * Determines if there are results available for the last executed query.
         */
        hasResults: state.search.results.length !== 0,
        /**
         * The duration, in milliseconds, that the last query took to execute.
         */
        durationInMilliseconds: state.search.duration,
        /**
         * The duration, in seconds, that the last query took to execute.
         */
        durationInSeconds: durationInSeconds(),
      };
    },
  };
};
