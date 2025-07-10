import type {InsightEngine} from '../../../app/insight-engine/insight-engine.js';
import {executeSearch} from '../../../features/insight-search/insight-search-actions.js';
import type {SortCriterion} from '../../../features/sort-criteria/criteria.js';
import {resultsSort} from '../../../features/sort-criteria/sort-criteria-analytics-actions.js';
import {logResultsSort} from '../../../features/sort-criteria/sort-criteria-insight-analytics-actions.js';
import {
  buildCoreSort,
  type Sort,
  type SortInitialState,
  type SortProps,
  type SortState,
} from '../../core/sort/headless-core-sort.js';

export type {Sort, SortProps, SortState, SortInitialState};

/**
 * Creates an insight `Sort` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 *
 * @group Controllers
 * @category Sort
 */
export function buildSort(engine: InsightEngine, props: SortProps = {}): Sort {
  const {dispatch} = engine;
  const sort = buildCoreSort(engine, props);
  const search = () =>
    dispatch(executeSearch({legacy: logResultsSort(), next: resultsSort()}));

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
