import {PayloadAction, AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client.js';
import {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import {foldingReducer as folding} from '../../features/folding/folding-slice.js';
import {
  registerFolding,
  loadCollection,
  StateNeededByLoadCollection,
  LoadCollectionFulfilledReturn,
  RegisterFoldingActionCreatorPayload,
} from './insight-folding-actions.js';

export type {RegisterFoldingActionCreatorPayload};

/**
 * The folding action creators.
 */
export interface InsightFoldingActionCreators {
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
    AsyncThunkInsightOptions<StateNeededByLoadCollection>
  >;
}

/**
 * Loads the `folding` reducer and returns possible action creators.
 *
 * @param engine - The headless engine (Insight).
 * @returns An object holding the action creators.
 */
export function loadFoldingActions(
  engine: InsightEngine
): InsightFoldingActionCreators {
  engine.addReducers({folding});

  return {
    registerFolding,
    loadCollection,
  };
}
