import {executeSearch} from '../../features/search/search-actions';
import {
  logPageNumber,
  logPageNext,
  logPagePrevious,
} from '../../features/pagination/pagination-analytics-actions';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  buildCorePager,
  PagerInitialState,
  PagerOptions,
  PagerProps,
  Pager,
  PagerState,
} from '../core/pager/headless-core-pager';

export {PagerInitialState, PagerOptions, PagerProps, Pager, PagerState};

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
      dispatch(executeSearch(logPageNumber()));
    },

    nextPage() {
      pager.nextPage();
      dispatch(executeSearch(logPageNext()));
    },

    previousPage() {
      pager.previousPage();
      dispatch(executeSearch(logPagePrevious()));
    },
  };
}
