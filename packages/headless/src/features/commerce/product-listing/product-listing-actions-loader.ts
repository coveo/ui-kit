import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {productListingReducer as productListing} from '../../../features/commerce/product-listing/product-listing-slice';
import {
  QueryCommerceAPIThunkReturn,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';
import {fetchProductListing} from './product-listing-actions';

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
    AsyncThunkCommerceOptions<StateNeededByQueryCommerceAPI>
  >;
}

/**
 * Loads the product listing reducer and returns the possible action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadProductListingActions(
  engine: CommerceEngine
): ProductListingActionCreators {
  engine.addReducers({productListing});

  return {
    fetchProductListing,
  };
}
