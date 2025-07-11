import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import {
  browseResults,
  logPagerResize,
} from '../../../features/pagination/pagination-analytics-actions.js';
import {
  buildCoreResultsPerPage,
  type ResultsPerPage,
  type ResultsPerPageInitialState,
  type ResultsPerPageProps,
  type ResultsPerPageState,
} from '../../core/results-per-page/headless-core-results-per-page.js';

export type {
  ResultsPerPage,
  ResultsPerPageProps,
  ResultsPerPageInitialState,
  ResultsPerPageState,
};

/**
 * Creates an insight `ResultsPerPage` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `ResultsPerPage` properties.
 * @returns A `ResultsPerPage` controller instance.
 *
 * @group Controllers
 * @category ResultsPerPage
 */
export function buildResultsPerPage(
  engine: InsightEngine,
  props: ResultsPerPageProps = {}
): ResultsPerPage {
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
      dispatch(
        executeSearch({legacy: logPagerResize(), next: browseResults()})
      );
    },
  };
}
