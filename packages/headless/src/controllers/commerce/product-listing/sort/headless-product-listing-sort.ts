import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {loadReducerError} from '../../../../utils/errors';
import {
  Sort,
  buildCoreSort,
  SortProps,
} from '../../sort/core/headless-core-commerce-sort';

/**
 * Creates a `Sort` controller instance for the product listing.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Sort` controller properties.
 * @returns A `Sort` controller instance.
 */
export function buildProductListingSort(
  engine: CommerceEngine,
  props: SortProps = {}
): Sort {
  if (!loadSortReducers(engine)) {
    throw loadReducerError;
  }

  return buildCoreSort(engine, {
    ...props,
    fetchResultsActionCreator: fetchProductListing,
  });
}

function loadSortReducers(engine: CommerceEngine): engine is CommerceEngine {
  engine.addReducers({productListing});
  return true;
}
