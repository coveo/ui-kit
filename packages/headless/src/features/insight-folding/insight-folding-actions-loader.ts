import {PayloadAction, AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {folding} from '../../app/reducers';
import {
  RegisterFoldingActionCreatorPayload,
  LoadCollectionFulfilledReturn,
  StateNeededByLoadCollection,
  registerFolding,
  loadCollection,
} from '../folding/folding-actions';
import {FoldingActionCreators} from '../folding/folding-actions-loader';

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
    AsyncThunkSearchOptions<StateNeededByLoadCollection>
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
): FoldingActionCreators {
  engine.addReducers({folding});

  return {
    registerFolding,
    loadCollection,
  };
}
