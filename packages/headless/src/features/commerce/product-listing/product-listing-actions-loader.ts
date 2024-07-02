import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {productListingReducer as productListing} from '../../../features/commerce/product-listing/product-listing-slice';
import {QueryCommerceAPIThunkReturn} from '../common/actions';
import {
  StateNeededByFetchProductListing,
  fetchMoreProducts,
  fetchProductListing,
} from './product-listing-actions';

/**
 * The product listing action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface ProductListingActionCreators {
  /**
   * Refreshes the product listing.
   *
   * @returns A dispatchable action.
   */
  fetchProductListing(): AsyncThunkAction<
    QueryCommerceAPIThunkReturn,
    void,
    AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
  >;

  /**
   * Fetches and additional page of products and appends it to the current list.
   *
   * @returns A dispatchable action.
   */
  fetchMoreProducts(): AsyncThunkAction<
    QueryCommerceAPIThunkReturn | null,
    void,
    AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
  >;

  // TODO KIT-3221 - Expose promoteChildToParent action and action payload creator.
}

/**
 * Loads the commerce product listing reducer and returns the available product listing action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the product listing action creators.
 */
export function loadProductListingActions(
  engine: CommerceEngine
): ProductListingActionCreators {
  engine.addReducers({productListing});

  return {
    fetchProductListing,
    fetchMoreProducts,
  };
}
