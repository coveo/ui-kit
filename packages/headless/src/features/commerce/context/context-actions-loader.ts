import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  SetContextActionCreatorPayload,
  SetUserActionCreatorPayload,
  SetViewActionCreatorPayload,
  setContext,
  setUser,
  setView,
} from './context-actions';
import {contextReducer as commerceContext} from './context-slice';

export type {
  SetContextActionCreatorPayload,
  SetUserActionCreatorPayload,
  SetViewActionCreatorPayload,
};

/**
 * The context action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface ContextActionCreators {
  /**
   * Sets the context.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setContext(
    payload: SetContextActionCreatorPayload
  ): PayloadAction<SetContextActionCreatorPayload>;

  /**
   * Sets the user.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setUser(
    payload: SetUserActionCreatorPayload
  ): PayloadAction<SetUserActionCreatorPayload>;

  /**
   * Sets the view.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setView(
    payload: SetViewActionCreatorPayload
  ): PayloadAction<SetViewActionCreatorPayload>;
}

/**
 * Loads the context reducer and returns the possible commerce context action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @returns An object holding the commerce context action creators.
 */
export function loadContextActions(
  engine: CommerceEngine
): ContextActionCreators {
  engine.addReducers({commerceContext});
  return {
    setContext,
    setUser,
    setView,
  };
}
