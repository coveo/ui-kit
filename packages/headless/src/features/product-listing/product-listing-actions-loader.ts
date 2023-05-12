import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkProductListingOptions} from '../../api/commerce/product-listings/product-listing-api-client';
import {ProductListingEngine} from '../../app/product-listing-engine/product-listing-engine';
import {productListingReducer as productListing} from '../../features/product-listing/product-listing-slice';
import {
  SetProductListingUrlPayload,
  FetchProductListingThunkReturn,
  fetchProductListing,
  setProductListingUrl,
  StateNeededByFetchProductListing,
} from './product-listing-actions';

export type {SetProductListingUrlPayload};

/**
 * The product listings action creators.
 */
export interface ProductListingActionCreators {
  /**
   * Updates the product listing url field.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setProductListingUrl(
    payload: SetProductListingUrlPayload
  ): PayloadAction<SetProductListingUrlPayload>;

  /**
   * Refreshes the product listing.
   *
   * @returns A dispatchable action.
   */
  fetchProductListing(): AsyncThunkAction<
    FetchProductListingThunkReturn,
    void,
    AsyncThunkProductListingOptions<StateNeededByFetchProductListing>
  >;
}

/**
 * Loads the `productListing` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadProductListingActions(
  engine: ProductListingEngine
): ProductListingActionCreators {
  engine.addReducers({productListing});

  return {
    setProductListingUrl,
    fetchProductListing,
  };
}
