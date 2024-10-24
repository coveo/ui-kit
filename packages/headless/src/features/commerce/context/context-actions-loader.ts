import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  SetContextPayload,
  SetViewPayload,
  setContext,
  setView,
  SetLocationPayload,
  setLocation,
} from './context-actions.js';
import {contextReducer as commerceContext} from './context-slice.js';

export type {SetContextPayload, SetViewPayload, SetLocationPayload};

/**
 * The context action creators.
 */
export interface ContextActionCreators {
  /**
   * Sets the entire context.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setContext(payload: SetContextPayload): PayloadAction<SetContextPayload>;

  /**
   * Sets the view context property without modifying any other context properties.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setView(payload: SetViewPayload): PayloadAction<SetViewPayload>;

  /**
   * Sets the location context property without modifying any other context properties.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setLocation(payload: SetLocationPayload): PayloadAction<SetLocationPayload>;
}

/**
 * Loads the commerce context reducer and returns the available context action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the context action creators.
 */
export function loadContextActions(
  engine: CommerceEngine
): ContextActionCreators {
  engine.addReducers({commerceContext});
  return {
    setContext,
    setView,
    setLocation,
  };
}
