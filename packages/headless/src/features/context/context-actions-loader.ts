import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine.js';
import {contextReducer as context} from '../../features/context/context-slice.js';
import {
  addContext,
  AddContextActionCreatorPayload,
  removeContext,
  setContext,
} from './context-actions.js';
import {ContextPayload} from './context-state.js';

export type {AddContextActionCreatorPayload};

/**
 * The context action creators.
 */
export interface ContextActionCreators {
  /**
   * Adds a new context value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  addContext(
    payload: AddContextActionCreatorPayload
  ): PayloadAction<AddContextActionCreatorPayload>;

  /**
   * Removes a context key-value pair.
   *
   * @param key - The key to remove from the context (e.g., "age").
   * @returns A dispatchable action.
   */
  removeContext(key: string): PayloadAction<string>;

  /**
   * Sets the query context.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setContext(payload: ContextPayload): PayloadAction<ContextPayload>;
}

/**
 * Loads the `context` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadContextActions(engine: CoreEngine): ContextActionCreators {
  engine.addReducers({context});

  return {
    addContext,
    removeContext,
    setContext,
  };
}
