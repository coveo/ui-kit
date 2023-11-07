import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
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
import {applySort} from '../../../../features/commerce/sort/sort-actions';
import {updatePage} from '../../../../features/pagination/pagination-actions';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';

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
 * Creates a `Sort` controller instance for the product listing.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildSort(engine: CommerceEngine, props: CoreSortProps = {}): Sort {
  const controller = buildCoreSort(engine, props, {productListing});

  return {
    ...controller,

    sortBy(criterion: SortCriterion) {
      controller.sortBy(criterion);
      engine.dispatch(fetchProductListing());
    },
  }
}
