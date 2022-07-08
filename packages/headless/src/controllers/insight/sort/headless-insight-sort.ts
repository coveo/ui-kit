import {executeSearch} from '../../../features/insight-search/insight-search-actions';
import {SortCriterion} from '../../../features/sort-criteria/criteria';
import {logResultsSort} from '../../../features/sort-criteria/sort-criteria-insight-analytics-actions';
import {InsightEngine} from '../../../app/insight-engine/insight-engine';
import {
  buildCoreSort,
  Sort,
  SortProps,
  SortState,
  SortInitialState,
} from '../../core/sort/headless-core-sort';

export type {Sort, SortProps, SortState, SortInitialState};

/**
 * Creates an `InsightSort` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `InsightSort` controller properties.
 * @returns A `InsightSort` controller instance.
 */
export function buildSort(engine: InsightEngine, props: SortProps = {}): Sort {
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
