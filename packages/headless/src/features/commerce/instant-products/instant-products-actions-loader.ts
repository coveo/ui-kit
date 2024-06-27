import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  ClearExpiredInstantProductsActionCreatorPayload,
  PromoteChildToParentActionCreatorPayload,
  RegisterInstantProductActionCreatorPayload,
  UpdateInstantProductQueryActionCreatorPayload,
  clearExpiredProducts,
  promoteChildToParent,
  registerInstantProducts,
  updateInstantProductsQuery,
} from './instant-products-actions';
import {instantProductsReducer as instantProducts} from './instant-products-slice';

export type {
  RegisterInstantProductActionCreatorPayload,
  UpdateInstantProductQueryActionCreatorPayload,
  ClearExpiredInstantProductsActionCreatorPayload,
  PromoteChildToParentActionCreatorPayload,
};

/**
 * The instant products action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface InstantProductsActionCreators {
  /**
   * Registers instant products.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerInstantProducts(
    payload: RegisterInstantProductActionCreatorPayload
  ): PayloadAction<RegisterInstantProductActionCreatorPayload>;

  /**
   * Updates the query for instant products.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateInstantProductsQuery(
    payload: UpdateInstantProductQueryActionCreatorPayload
  ): PayloadAction<UpdateInstantProductQueryActionCreatorPayload>;

  /**
   * Clears expired instant products.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  clearExpiredProducts(
    payload: ClearExpiredInstantProductsActionCreatorPayload
  ): PayloadAction<ClearExpiredInstantProductsActionCreatorPayload>;

  /**
   * Promotes a child product to a parent product.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  promoteChildToParent(
    payload: PromoteChildToParentActionCreatorPayload
  ): PayloadAction<PromoteChildToParentActionCreatorPayload>;
}

/**
 * Loads the commerce instant products reducer and returns the possible instant products actions.
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
    registerInstantProducts,
    updateInstantProductsQuery,
    clearExpiredProducts,
    promoteChildToParent,
  };
}
