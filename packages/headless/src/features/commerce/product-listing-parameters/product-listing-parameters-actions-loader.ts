import {PayloadAction} from '@reduxjs/toolkit';
import {
  RestoreProductListingParametersActionCreatorPayload,
  restoreProductListingParameters,
} from './product-listing-parameters-actions';

export type {RestoreProductListingParametersActionCreatorPayload};

/**
 * The product listing parameters action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface ProductListingParametersActionCreators {
  /**
   * Restores the product listing parameters.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  restoreProductListingParameters(
    payload: RestoreProductListingParametersActionCreatorPayload
  ): PayloadAction<RestoreProductListingParametersActionCreatorPayload>;
}

/**
 * Returns the possible product listing parameters action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the product listing parameters action creators.
 */
export function loadProductListingParametersActions(): ProductListingParametersActionCreators {
  return {
    restoreProductListingParameters,
  };
}
