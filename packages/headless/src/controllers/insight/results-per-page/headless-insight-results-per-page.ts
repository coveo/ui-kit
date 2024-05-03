import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {
  logPagerResize,
  pagerResize,
} from '../../../features/pagination/pagination-analytics-actions';
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
 * Creates an insight `ResultsPerPage` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `ResultsPerPage` properties.
 * @returns A `ResultsPerPage` controller instance.
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
      dispatch(executeSearch({legacy: logPagerResize(), next: pagerResize()}));
    },
  };
}
