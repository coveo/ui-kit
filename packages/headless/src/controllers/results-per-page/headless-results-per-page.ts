import {configuration} from '../../app/common-reducers.js';
import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {
  browseResults,
  logPagerResize,
} from '../../features/pagination/pagination-analytics-actions.js';
import {paginationReducer as pagination} from '../../features/pagination/pagination-slice.js';
import {fetchPage} from '../../features/search/search-actions.js';
import type {
  ConfigurationSection,
  PaginationSection,
} from '../../state/state-sections.js';
import {loadReducerError} from '../../utils/errors.js';
import {
  buildCoreResultsPerPage,
  type ResultsPerPage,
  type ResultsPerPageInitialState,
  type ResultsPerPageProps,
  type ResultsPerPageState,
} from '../core/results-per-page/headless-core-results-per-page.js';

export type {
  ResultsPerPage,
  ResultsPerPageInitialState,
  ResultsPerPageProps,
  ResultsPerPageState,
};

/**
 * Creates a `ResultsPerPage` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `ResultsPerPage` properties.
 * @returns A `ResultsPerPage` controller instance.
 *
 * @group Controllers
 * @category ResultsPerPage
 */
export function buildResultsPerPage(
  engine: SearchEngine | FrankensteinEngine,
  props: ResultsPerPageProps = {}
): ResultsPerPage {
  const searchEngine = ensureSearchEngine(engine);
  if (!loadResultsPerPageReducers(searchEngine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreResultsPerPage(searchEngine, props);
  const {dispatch} = searchEngine;

  return {
    ...coreController,

    get state() {
      return {
        ...coreController.state,
      };
    },

    set(num: number) {
      coreController.set(num);
      dispatch(fetchPage({legacy: logPagerResize(), next: browseResults()}));
    },
  };
}

function loadResultsPerPageReducers(
  engine: SearchEngine
): engine is SearchEngine<PaginationSection & ConfigurationSection> {
  engine.addReducers({pagination, configuration});
  return true;
}
