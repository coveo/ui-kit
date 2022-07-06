import {fetchPage} from '../../../features/insight-search/insight-search-actions';
import {
  logPageNumber,
  logPageNext,
  logPagePrevious,
} from '../../../features/pagination/pagination-analytics-actions';
import {
  buildCorePager,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  Pager,
  PagerState,
} from '../../core/pager/headless-core-pager';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';

export type {PagerInitialState, PagerOptions, PagerProps, Pager, PagerState};

/**
 * Creates a `InsightPager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Pager` properties.
 * @returns A `InsightPager` controller instance.
 * */
export function buildInsightPager(
  engine: InsightEngine,
  props: PagerProps = {}
): Pager {
  const {dispatch} = engine;
  const pager = buildCorePager(engine, props);

  return {
    ...pager,

    get state() {
      return pager.state;
    },

    selectPage(page: number) {
      pager.selectPage(page);
      dispatch(fetchPage(logPageNumber()));
    },

    nextPage() {
      pager.nextPage();
      dispatch(fetchPage(logPageNext()));
    },

    previousPage() {
      pager.previousPage();
      dispatch(fetchPage(logPagePrevious()));
    },
  };
}
