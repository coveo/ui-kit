import {
  SortByField,
  SortByRelevancy,
} from '../../../features/sort-criteria/criteria';
import {
  buildCoreSort,
  Sort,
  SortInitialState,
  SortProps,
  SortState,
} from '../../core/sort/headless-core-sort';
import {fetchProductListing} from '../../../features/product-listing/product-listing-actions';
import {ProductListingEngine} from '../../../app/product-listing-engine/product-listing-engine';

export {SortInitialState, Sort, SortProps, SortState};

export type ProductListingSortCriterion = SortByRelevancy | SortByField;
/**
 * Creates a `Sort` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildSort(
  engine: ProductListingEngine,
  props: SortProps = {}
): Sort {
  const {dispatch} = engine;
  const sort = buildCoreSort(engine, props);

  return {
    ...sort,

    sortBy(
      criterion: ProductListingSortCriterion | ProductListingSortCriterion[]
    ) {
      sort.sortBy(criterion);
      dispatch(fetchProductListing());
    },

    get state() {
      return sort.state;
    },
  };
}
