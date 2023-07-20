import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {CommercePlacementsEngine} from '../../commerce-placement.index';
import {placementSetReducer as placementSet} from '../../features/placement-set/placement-set-slice';
import {
  SetPlacementSetSkusActionCreatorPayload,
  SetPlacementSetViewActionCreatorPayload,
  GetRecommendationsCreatorPayload,
  GetBadgesCreatorPayload,
  AsyncThunkPlacementOptions,
  setImplementationId,
  setCartSkus,
  setOrderSkus,
  setPlpSkus,
  setProductSku,
  setRecsSkus,
  setSearchSkus,
  setView,
  getBadge,
  getRecs,
  SetPlacementSetLocaleActionCreatorPayload,
  setLocale,
} from './placement-set-action';
import {Badges, Recommendations} from './placement-set-interface';

/**
 * The product listings action creators.
 */
export interface PlacementSetActionCreators {
  /**
   * Sets the cart SKUs.
   *
   * @param payload The SKUs in the products in the client's cart.
   * @returns A dispatchable action.
   */
  setCartSkus(
    payload: SetPlacementSetSkusActionCreatorPayload
  ): PayloadAction<SetPlacementSetSkusActionCreatorPayload>;

  /**
   * Sets the implementation ID.
   *
   * @param payload The implementation ID.
   * @returns A dispatchable action.
   */
  setImplementationId(payload: string): PayloadAction<string>;

  /**
   * Sets the order SKUs.
   *
   * @param payload The SKUs of the products in the client's order if the active view is a checkout or confirmation page.
   * @returns A dispatchable action.
   */
  setOrderSkus(
    payload: SetPlacementSetSkusActionCreatorPayload
  ): PayloadAction<SetPlacementSetSkusActionCreatorPayload>;

  /**
   * Sets the PLP SKUs.
   *
   * @param payload The SKUs of the products displayed if the active view is a product listing page (PLP).
   * @returns A dispatchable action.
   */
  setPlpSkus(
    payload: SetPlacementSetSkusActionCreatorPayload
  ): PayloadAction<SetPlacementSetSkusActionCreatorPayload>;

  /**
   * Sets the product SKU.
   *
   * @param payload The SKU of the product displayed if the active view is a product description page (PDP).
   * @returns A dispatchable action.
   */
  setProductSku(payload: string): PayloadAction<string>;

  /**
   * Sets the recs SKUs.
   *
   * @param payload The SKUs of the products displayed as recommendations in the active view.
   * @returns A dispatchable action.
   */
  setRecsSkus(
    payload: SetPlacementSetSkusActionCreatorPayload
  ): PayloadAction<SetPlacementSetSkusActionCreatorPayload>;

  /**
   * Sets the search SKUs.
   *
   * @param payload The SKUs of the products displayed as search results in the current view.
   * @returns A dispatchable action.
   */
  setSearchSkus(
    payload: SetPlacementSetSkusActionCreatorPayload
  ): PayloadAction<SetPlacementSetSkusActionCreatorPayload>;

  /**
   * Sets the locale context.
   *
   * @param payload The current locale.
   * @returns A dispatchable action.
   */
  setLocale(
    payload: SetPlacementSetLocaleActionCreatorPayload
  ): PayloadAction<SetPlacementSetLocaleActionCreatorPayload>;

  /**
   * Sets the view context.
   *
   * @param payload The active view.
   * @returns A dispatchable action.
   */
  setView(
    payload: SetPlacementSetViewActionCreatorPayload
  ): PayloadAction<SetPlacementSetViewActionCreatorPayload>;

  /**
   * Gets product badging.
   *
   * @param payload The unique identifier of the Placement from which to request product badging.
   * @returns A dispatchable action.
   */
  getBadge(
    payload: GetBadgesCreatorPayload
  ): AsyncThunkAction<
    Badges & {placementId: string},
    GetBadgesCreatorPayload,
    AsyncThunkPlacementOptions
  >;

  /**
   * Gets product recommendations.
   *
   * @param payload The unique identifier of the Placement from which to request product recommendations.
   * @returns A dispatchable action.
   */
  getRecs(
    payload: GetRecommendationsCreatorPayload
  ): AsyncThunkAction<
    Recommendations & {placementId: string},
    GetRecommendationsCreatorPayload,
    AsyncThunkPlacementOptions
  >;
}

/**
 * Loads the commerce Placement actions.
 *
 * @param engine The headless commerce Placement engine.
 * @returns An object holding the action creators.
 */
export function loadPlacementSetActions(
  engine: CommercePlacementsEngine
): PlacementSetActionCreators {
  engine.addReducers({placementSet});

  return {
    setCartSkus,
    setImplementationId,
    setOrderSkus,
    setPlpSkus,
    setProductSku,
    setRecsSkus,
    setSearchSkus,
    setLocale,
    setView,
    getBadge,
    getRecs,
  };
}
