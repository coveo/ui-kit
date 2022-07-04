import {CoreEngine} from '../../../app/engine';
import {pagination, search} from '../../../app/reducers';
import {PaginationSection, SearchSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {buildCoreStatus, CoreStatusState} from '../status/headless-core-status';

/**
 * The `CoreQuerySummary` headless controller offers a high-level interface for designing a common query summary UI controller.
 * */
export interface CoreQuerySummary extends Controller {
  /** The state relevant to the `CoreQuerySummary` controller.*/
  state: CoreQuerySummaryState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `CoreQuerySummary` controller.
 * */
export interface CoreQuerySummaryState extends CoreStatusState {
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
 * Creates a `CoreQuerySummary` controller instance.
 *
 * @param engine - The headless engine instance.
 * @returns A `CoreQuerySummary` controller instance.
 */
export function buildCoreQuerySummary(engine: CoreEngine): CoreQuerySummary {
  if (!loadQuerySummaryReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const searchStatus = buildCoreStatus(engine);
  const getState = () => engine.state;

  const durationInSeconds = () => {
    const inSeconds = getState().search.duration / 1000;
    return Math.round((inSeconds + Number.EPSILON) * 100) / 100;
  };

  return {
    ...controller,

    get state() {
      return {
        ...searchStatus.state,
        durationInMilliseconds: getState().search.duration,
        durationInSeconds: durationInSeconds(),
        firstResult: getState().pagination.firstResult + 1,
        hasDuration: getState().search.duration !== 0,
        hasQuery: getState().search.queryExecuted !== '',
        lastResult:
          getState().pagination.firstResult + getState().search.results.length,
        query: getState().search.queryExecuted,
        total: getState().pagination.totalCountFiltered,
      };
    },
  };
}

function loadQuerySummaryReducers(
  engine: CoreEngine
): engine is CoreEngine<SearchSection & PaginationSection> {
  engine.addReducers({search, pagination});
  return true;
}
