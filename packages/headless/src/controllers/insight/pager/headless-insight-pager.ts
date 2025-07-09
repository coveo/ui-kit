import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {fetchPage} from '../../../features/insight-search/insight-search-actions.js';
import {browseResults} from '../../../features/pagination/pagination-analytics-actions.js';
import {
  logPageNext,
  logPageNumber,
  logPagePrevious,
} from '../../../features/pagination/pagination-insight-analytics-actions.js';
import {
  buildCorePager,
  type Pager,
  type PagerInitialState,
  type PagerOptions,
  type PagerProps,
  type PagerState,
} from '../../core/pager/headless-core-pager.js';

export type {PagerInitialState, PagerOptions, PagerProps, Pager, PagerState};

/**
 * Creates an insight `Pager` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `Pager` properties.
 * @returns A `Pager` controller instance.
 *
 * @group Controllers
 * @category Pager
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
      dispatch(fetchPage({legacy: logPageNumber(), next: browseResults()}));
    },

    nextPage() {
      pager.nextPage();
      dispatch(fetchPage({legacy: logPageNext(), next: browseResults()}));
    },

    previousPage() {
      pager.previousPage();
      dispatch(fetchPage({legacy: logPagePrevious(), next: browseResults()}));
    },
  };
}
