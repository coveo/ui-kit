import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  logPageNumber,
  logPageNext,
  logPagePrevious,
} from '../../features/pagination/pagination-analytics-actions';
import {fetchPage} from '../../features/search/search-actions';
import {
  buildCorePager,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  Pager,
  PagerState,
} from '../core/pager/headless-core-pager';

export type {PagerInitialState, PagerOptions, PagerProps, Pager, PagerState};

/**
 * Creates a `Pager` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Pager` properties.
 * @returns A `Pager` controller instance.
 * */
export function buildPager(
  engine: SearchEngine,
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
