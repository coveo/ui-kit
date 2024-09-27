import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {SortCriterion} from '../../features/sort-criteria/criteria.js';
import {
  logResultsSort,
  resultsSort,
} from '../../features/sort-criteria/sort-criteria-analytics-actions.js';
import {
  buildCoreSort,
  Sort,
  SortProps,
  SortState,
  SortInitialState,
} from '../core/sort/headless-core-sort.js';

export type {Sort, SortProps, SortState, SortInitialState};

/**
 * Creates a `Sort` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildSort(engine: SearchEngine, props: SortProps = {}): Sort {
  const {dispatch} = engine;
  const sort = buildCoreSort(engine, props);
  const search = () =>
    dispatch(
      executeSearch({
        legacy: logResultsSort(),
        next: resultsSort(),
      })
    );

  return {
    ...sort,

    get state() {
      return sort.state;
    },

    sortBy(criterion: SortCriterion | SortCriterion[]) {
      sort.sortBy(criterion);
      search();
    },
  };
}
