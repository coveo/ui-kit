import {configuration, pagination} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {logPagerResize} from '../../features/pagination/pagination-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {
  ConfigurationSection,
  PaginationSection,
} from '../../state/state-sections';
import {loadReducerError} from '../../utils/errors';
import {
  buildCoreResultsPerPage,
  ResultsPerPage,
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
} from '../core/results-per-page/headless-core-results-per-page';

export type {
  ResultsPerPage,
  ResultsPerPageProps,
  ResultsPerPageInitialState,
  ResultsPerPageState,
};

/**
 * Creates a `ResultsPerPage` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ResultsPerPage` properties.
 * @returns A `ResultsPerPage` controller instance.
 */
export function buildResultsPerPage(
  engine: SearchEngine,
  props: ResultsPerPageProps = {}
): ResultsPerPage {
  if (!loadResultsPerPageReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreResultsPerPage(engine, props);
  const {dispatch} = engine;

  return {
    ...coreController,

    get state() {
      return {
        ...coreController.state,
      };
    },

    set(num: number) {
      coreController.set(num);
      dispatch(executeSearch(logPagerResize()));
    },
  };
}

function loadResultsPerPageReducers(
  engine: SearchEngine
): engine is SearchEngine<PaginationSection & ConfigurationSection> {
  engine.addReducers({pagination, configuration});
  return true;
}
