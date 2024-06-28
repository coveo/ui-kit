import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  ClearExpiredInstantProductsPayload,
  PromoteChildToParentPayload,
  RegisterInstantProductPayload,
  UpdateInstantProductQueryPayload,
  clearExpiredProducts,
  promoteChildToParent,
  registerInstantProducts,
  updateInstantProductsQuery,
} from './instant-products-actions';
import {instantProductsReducer as instantProducts} from './instant-products-slice';

export type {
  ClearExpiredInstantProductsPayload,
  PromoteChildToParentPayload,
  RegisterInstantProductPayload,
  UpdateInstantProductQueryPayload,
};

/**
 * The instant products action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface InstantProductsActionCreators {
  /**
   * Clears expired instant products.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  clearExpiredProducts(
    payload: ClearExpiredInstantProductsPayload
  ): PayloadAction<ClearExpiredInstantProductsPayload>;

  /**
   * Promotes a child product to a parent product.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  promoteChildToParent(
    payload: PromoteChildToParentPayload
  ): PayloadAction<PromoteChildToParentPayload>;

  /**
   * Registers instant products.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerInstantProducts(
    payload: RegisterInstantProductPayload
  ): PayloadAction<RegisterInstantProductPayload>;

  /**
   * Updates the query for instant products.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateInstantProductsQuery(
    payload: UpdateInstantProductQueryPayload
  ): PayloadAction<UpdateInstantProductQueryPayload>;
}

/**
 * Loads the commerce instant products reducer and returns the available instant products actions.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the instant products action creators.
 */
export function loadInstantProductsActions(
  engine: CommerceEngine
): InstantProductsActionCreators {
  engine.addReducers({instantProducts});
  return {
    clearExpiredProducts,
    promoteChildToParent,
    registerInstantProducts,
    updateInstantProductsQuery,
  };
}
