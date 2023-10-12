import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client.js';
import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {foldingReducer as folding} from '../../features/folding/folding-slice.js';
import {
  registerFolding,
  RegisterFoldingActionCreatorPayload,
  loadCollection,
  LoadCollectionFulfilledReturn,
  StateNeededByLoadCollection,
} from './folding-actions.js';

export type {RegisterFoldingActionCreatorPayload};

/**
 * The folding action creators.
 */
export interface FoldingActionCreators {
  /**
   * Registers a folding configuration.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerFolding(
    payload: RegisterFoldingActionCreatorPayload
  ): PayloadAction<RegisterFoldingActionCreatorPayload>;

  /**
   * Loads the results of a collection.
   *
   * @param collectionId - The collection id to load results for.
   * @returns A dispatchable action.
   */
  loadCollection(
    collectionId: string
  ): AsyncThunkAction<
    LoadCollectionFulfilledReturn,
    string,
    AsyncThunkSearchOptions<StateNeededByLoadCollection>
  >;
}

/**
 * Loads the `folding` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadFoldingActions(
  engine: SearchEngine
): FoldingActionCreators {
  engine.addReducers({folding});

  return {
    registerFolding,
    loadCollection,
  };
}
