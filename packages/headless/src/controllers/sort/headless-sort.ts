import {executeSearch} from '../../features/search/search-actions';
import {SortCriterion} from '../../features/sort-criteria/criteria';
import {logResultsSort} from '../../features/sort-criteria/sort-criteria-analytics-actions';
import {SearchEngine} from '../../app/search-engine/search-engine';
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
  const coreController = buildCoreSort(engine, props);
  const search = () => dispatch(executeSearch(logResultsSort()));

  return {
    ...coreController,

    sortBy(criterion: SortCriterion | SortCriterion[]) {
      coreController.sortBy(criterion);
      search();
    },
  };
}
