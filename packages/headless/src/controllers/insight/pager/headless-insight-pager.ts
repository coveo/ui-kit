import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {fetchPage} from '../../../features/insight-search/insight-search-actions';
import {
  logPageNumber,
  logPageNext,
  logPagePrevious,
} from '../../../features/pagination/pagination-insight-analytics-actions';
import {
  buildCorePager,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  Pager,
  PagerState,
} from '../../core/pager/headless-core-pager';

export type {PagerInitialState, PagerOptions, PagerProps, Pager, PagerState};

/**
 * Creates an insight `Pager` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `Pager` properties.
 * @returns A `Pager` controller instance.
 * */
export function buildPager(
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
      dispatch(fetchPage({legacy: logPageNumber()}));
    },

    nextPage() {
      pager.nextPage();
      dispatch(fetchPage({legacy: logPageNext()}));
    },

    previousPage() {
      pager.previousPage();
      dispatch(fetchPage({legacy: logPagePrevious()}));
    },
  };
}
