import type {PayloadAction} from '@reduxjs/toolkit';
import type {CoreEngine} from '../../app/engine.js';
import {dictionaryFieldContextReducer as dictionaryFieldContext} from '../../features/dictionary-field-context/dictionary-field-context-slice.js';
import {
  type AddDictionaryFieldContextActionCreatorPayload,
  addContext,
  removeContext,
  setContext,
} from './dictionary-field-context-actions.js';
import type {DictionaryFieldContextPayload} from './dictionary-field-context-state.js';

export type {AddDictionaryFieldContextActionCreatorPayload};

/**
 * The dictionary field context action creators.
 *
 * @group Actions
 * @category DictionaryFieldContext
 */
export interface DictionaryFieldContextActionCreators {
  /**
   * Adds a new dictionary field context field-key pair.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  addContext(
    payload: AddDictionaryFieldContextActionCreatorPayload
  ): PayloadAction<AddDictionaryFieldContextActionCreatorPayload>;

  /**
   * Removes a dictionary field context field-key pair.
   *
   * @param field - The field to remove from the context (for example, "price").
   * @returns A dispatchable action.
   */
  removeContext(field: string): PayloadAction<string>;

  /**
   * Sets the dictionary field context.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setContext(
    payload: DictionaryFieldContextPayload
  ): PayloadAction<DictionaryFieldContextPayload>;
}

/**
 * Loads the `context` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category DictionaryFieldContext
 */
export function loadDictionaryFieldContextActions(
  engine: CoreEngine
): DictionaryFieldContextActionCreators {
  engine.addReducers({dictionaryFieldContext});

  return {
    addContext,
    removeContext,
    setContext,
  };
}
