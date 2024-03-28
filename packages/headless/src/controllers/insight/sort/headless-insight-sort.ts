import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {SortCriterion} from '../../../features/sort-criteria/criteria';
import {resultsSort} from '../../../features/sort-criteria/sort-criteria-analytics-actions';
import {logResultsSort} from '../../../features/sort-criteria/sort-criteria-insight-analytics-actions';
import {
  buildCoreSort,
  Sort,
  SortProps,
  SortState,
  SortInitialState,
} from '../../core/sort/headless-core-sort';

export type {Sort, SortProps, SortState, SortInitialState};

/**
 * Creates an insight `Sort` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
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
