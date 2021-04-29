import {Engine} from '../../app/headless-engine';
import {pagination, search} from '../../app/reducers';
import {PaginationSection, SearchSection} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {buildController, Controller} from '../controller/headless-controller';
import {
  buildSearchStatus,
  SearchStatusState,
} from '../search-status/headless-search-status';

/**
 * The `QuerySummary` controller provides information about the current query and results (e.g., "Results
 * 1-10 of 123").
 * */
export interface QuerySummary extends Controller {
  /** The state relevant to the `QuerySummary` controller.*/
  state: QuerySummaryState;
}

export interface QuerySummaryState extends SearchStatusState {
  /**
   * The duration, in milliseconds, that the last query took to execute.
   */
  durationInMilliseconds: number;

  /**
   * The duration, in seconds, that the last query took to execute.
   */
  durationInSeconds: number;

  /**
   * The 1-based index of the first search result returned for the current page.
   */
  firstResult: number;

  /**
   * Determines if a query execution time is available.
   */
  hasDuration: boolean;

  /**
   * Determines if an empty query was executed.
   */
  hasQuery: boolean;

  /**
   * The 1-based index of the last search result returned for the current page.
   */
  lastResult: number;

  /**
   * The query that was last executed (the content of the searchbox).
   */
  query: string;

  /**
   * The total count of results available.
   */
  total: number;
}

/**
 * Creates a `QuerySummary` controller instance.
 *
 * @param engine - The headless engine instance.
 */
export function buildQuerySummary(engine: Engine<object>): QuerySummary {
  if (!loadQuerySummaryReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const searchStatus = buildSearchStatus(engine);
  const getState = () => engine.state;

  const durationInSeconds = () => {
    const state = engine.state;
    const inSeconds = state.search.duration / 1000;
    return Math.round((inSeconds + Number.EPSILON) * 100) / 100;
  };

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        ...searchStatus.state,
        durationInMilliseconds: state.search.duration,
        durationInSeconds: durationInSeconds(),
        firstResult: state.pagination.firstResult + 1,
        hasDuration: state.search.duration !== 0,
        hasQuery: state.search.queryExecuted !== '',
        lastResult: state.pagination.firstResult + state.search.results.length,
        query: state.search.queryExecuted,
        total: state.pagination.totalCountFiltered,
      };
    },
  };
}

function loadQuerySummaryReducers(
  engine: Engine<object>
): engine is Engine<SearchSection & PaginationSection> {
  engine.addReducers({search, pagination});
  return true;
}
