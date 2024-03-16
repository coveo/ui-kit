import {SearchEngine} from '../../app/search-engine/search-engine';
import {executeSearch} from '../../features/search/search-actions';
import {SortCriterion} from '../../features/sort-criteria/criteria';
import {
  resultsSort,
} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {
  buildCoreSort,
  Sort,
  SortProps,
  SortState,
  SortInitialState,
} from '../core/sort/headless-core-sort';

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
