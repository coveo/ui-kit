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
  setView,
  getBadge,
  getRecs,
  SetPlacementSetLocaleActionCreatorPayload,
  setLocale,
  setSkus,
  setPlacementContext,
} from './placement-set-action';
import {Badges, Recommendations} from './placement-set-interface';

/**
 * The product listings action creators.
 */
export interface PlacementSetActionCreators {
  /**
   * Sets the implementation ID.
   *
   * @param payload The implementation ID.
   * @returns A dispatchable action.
   */
  setImplementationId(payload: string): PayloadAction<string>;

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
   * Sets the Placement context.
   *
   * @param payload The Placement context.
   * @returns A dispatchable action.
   */
  setPlacementContext(
    payload: SetPlacementSetSkusActionCreatorPayload &
      SetPlacementSetViewActionCreatorPayload
  ): PayloadAction<
    SetPlacementSetSkusActionCreatorPayload &
      SetPlacementSetViewActionCreatorPayload
  >;

  /**
   * Sets the SKUs context.
   *
   * @param payload The relevant SKUs.
   * @returns A dispatchable action.
   */
  setSkus(
    payload: SetPlacementSetSkusActionCreatorPayload
  ): PayloadAction<SetPlacementSetSkusActionCreatorPayload>;

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
    setImplementationId,
    setLocale,
    setPlacementContext,
    setSkus,
    setView,
    getBadge,
    getRecs,
  };
}
