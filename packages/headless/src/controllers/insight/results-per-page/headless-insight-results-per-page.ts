import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {logPagerResize} from '../../../features/pagination/pagination-analytics-actions';
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
 * Creates an `InsightResultsPerPage` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InsightResultsPerPage` properties.
 * @returns An `InsightResultsPerPage` controller instance.
 */
export function buildInsightResultsPerPage(
  engine: InsightEngine,
  props: ResultsPerPageProps = {}
): ResultsPerPage {
  const coreController = buildCoreResultsPerPage(engine, props);
  const {dispatch} = engine;

  return {
    ...coreController,

    set(num: number) {
      coreController.set(num);
      dispatch(executeSearch(logPagerResize()));
    },
  };
}
