import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {productListingReducer as productListing} from '../../../features/commerce/product-listing/product-listing-slice.js';
import {
  fetchMoreProducts,
  fetchProductListing,
  type PromoteChildToParentPayload,
  promoteChildToParent,
  type QueryCommerceAPIThunkReturn,
  type StateNeededByFetchProductListing,
} from './product-listing-actions.js';

/**
 * The product listing action creators.
 *
 * @group Actions
 * @category ProductListing
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

  /**
   * Promotes a child product to a parent product.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  promoteChildToParent(
    payload: PromoteChildToParentPayload
  ): PayloadAction<PromoteChildToParentPayload>;
}

/**
 * Loads the commerce product listing reducer and returns the available product listing action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the product listing action creators.
 *
 * @group Actions
 * @category ProductListing
 */
export function loadProductListingActions(
  engine: CommerceEngine
): ProductListingActionCreators {
  engine.addReducers({productListing});

  return {
    fetchProductListing,
    fetchMoreProducts,
    promoteChildToParent,
  };
}
