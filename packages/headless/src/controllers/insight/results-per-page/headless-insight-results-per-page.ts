import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {insightSearch} from '../../../app/reducers';
import {insightExecuteSearch} from '../../../features/insight-search/insight-search-actions';
import {logPagerResize} from '../../../features/pagination/pagination-analytics-actions';
import {
  ConfigurationSection,
  PaginationSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  ResultsPerPage,
  ResultsPerPageProps,
  ResultsPerPageInitialState,
  ResultsPerPageState,
  buildCoreResultsPerPage,
} from '../../core/results-per-page/headless-core-results-per-page';

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
export function buildInsightResultsPerPage(
  engine: InsightEngine,
  props: ResultsPerPageProps = {}
): ResultsPerPage {
  if (!loadResultsPerPageReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreResultsPerPage(engine, props);
  const {dispatch} = engine;

  return {
    ...coreController,

    set(num: number) {
      coreController.set(num);
      dispatch(insightExecuteSearch(logPagerResize()));
    },
  };
}

function loadResultsPerPageReducers(
  engine: InsightEngine
): engine is InsightEngine<PaginationSection & ConfigurationSection> {
  engine.addReducers({insightSearch});
  return true;
}
