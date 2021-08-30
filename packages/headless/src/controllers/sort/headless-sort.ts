import {executeSearch} from '../../features/search/search-actions';
import {SortCriterion} from '../../features/sort-criteria/criteria';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  buildCoreSort,
  Sort,
  SortInitialState,
  SortProps,
  SortState,
} from '../core/sort/headless-core-sort';

export {SortInitialState, SortProps, Sort, SortState};

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

  const search = () => dispatch(executeSearch(logResultsSort()));

  return {
    ...sort,

    sortBy(criterion: SortCriterion | SortCriterion[]) {
      sort.sortBy(criterion);
      search();
    },

    get state() {
      return sort.state;
    },
  };
}
