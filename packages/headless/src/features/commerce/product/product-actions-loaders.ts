import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine';
import {
  ProductClickActionCreatorPayload,
  ProductViewActionCreatorPayload,
  productClick,
  productView,
} from './product-actions';

export type {ProductClickActionCreatorPayload, ProductViewActionCreatorPayload};

/**
 * The product action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface ProductActionCreators {
  /**
   * Logs a click analytics event for a product.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  productClick(
    payload: ProductClickActionCreatorPayload
  ): AsyncThunkAction<
    void,
    ProductClickActionCreatorPayload,
    AsyncThunkCommerceOptions<CommerceEngineState>
  >;

  /**
   * Logs a view analytics event for a product.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  productView(
    payload: ProductViewActionCreatorPayload
  ): AsyncThunkAction<
    void,
    ProductViewActionCreatorPayload,
    AsyncThunkCommerceOptions<CommerceEngineState>
  >;
}

/**
 * Returns the possible product action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @returns An object holding the action creators.
 */
export function loadProductActions(): ProductActionCreators {
  return {
    productClick,
    productView,
  };
}
