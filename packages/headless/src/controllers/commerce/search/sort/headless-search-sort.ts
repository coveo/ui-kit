import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  buildFieldsSortCriterion,
  buildRelevanceSortCriterion,
  SortBy,
  SortByFields,
  SortByFieldsFields,
  SortByRelevance,
  SortCriterion,
  SortDirection,
} from '../../../../features/commerce/sort/sort';
import {buildCoreSort, CoreSortProps, CoreSortInitialState, CoreSort, CoreSortState} from '../../sort/headless-sort';
import {searchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {executeSearch} from '../../../../features/commerce/search/search-actions';

export type {
  SortByRelevance, SortByFields, SortByFieldsFields, SortCriterion,
  CoreSortProps as SortProps,
  CoreSortInitialState as SortInitialState,
  CoreSortState as SortState
};
export {
  SortBy,
  SortDirection,
  buildRelevanceSortCriterion,
  buildFieldsSortCriterion
};

export type Sort = CoreSort;

/**
 * Creates a `Sort` controller instance for the search.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildSort(engine: CommerceEngine, props: CoreSortProps = {}): Sort {
  const controller = buildCoreSort(engine, props, {commerceSearch})

  return {
    ...controller,

    sortBy(criterion: SortCriterion) {
      controller.sortBy(criterion);
      engine.dispatch(executeSearch());
    },
  }
}
