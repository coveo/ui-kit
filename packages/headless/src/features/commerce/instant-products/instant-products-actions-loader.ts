import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  type ClearExpiredInstantProductsPayload,
  type CoreInstantProductPayload,
  clearExpiredProducts,
  type PromoteChildToParentPayload,
  promoteChildToParent,
  type RegisterInstantProductPayload,
  registerInstantProducts,
  type UpdateInstantProductQueryPayload,
  updateInstantProductsQuery,
} from './instant-products-actions.js';
import {instantProductsReducer as instantProducts} from './instant-products-slice.js';

export type {
  ClearExpiredInstantProductsPayload,
  CoreInstantProductPayload,
  PromoteChildToParentPayload,
  RegisterInstantProductPayload,
  UpdateInstantProductQueryPayload,
};

/**
 * The instant products action creators.
 *
 * @group Actions
 * @category InstantProducts
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
 * @param engine - The commerce engine.
 * @returns An object holding the instant products action creators.
 *
 * @group Actions
 * @category InstantProducts
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
