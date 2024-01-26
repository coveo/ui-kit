import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {loadReducerError} from '../../../../utils/errors';
import {
  Sort,
  buildCoreSort,
  SortProps,
} from '../../core/sort/headless-core-commerce-sort';
import {loadProductListingReducer} from '../utils/load-product-listing-reducers';

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
  if (!loadProductListingReducer(engine)) {
    throw loadReducerError;
  }

  return buildCoreSort(engine, {
    ...props,
    fetchResultsActionCreator: fetchProductListing,
  });
}
