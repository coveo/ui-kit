import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {tabSetReducer as tabSet} from '../../features/tab-set/tab-set-slice.js';
import {
  registerTab,
  RegisterTabActionCreatorPayload,
  updateActiveTab,
} from './tab-set-actions.js';

export type {RegisterTabActionCreatorPayload};

/**
 * The tab set action creators.
 */
export interface TabSetActionCreators {
  /**
   * Registers a tab.
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerTab(
    payload: RegisterTabActionCreatorPayload
  ): PayloadAction<RegisterTabActionCreatorPayload>;
  /**
   * Updates the active tab, deselecting other tabs.
   * @param id - The unique identifier of the target tab (e.g., `"abc"`).
   * @returns A dispatchable action.
   */
  updateActiveTab(id: string): PayloadAction<string>;
}

/**
 * Loads the `tabSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadTabSetActions(engine: SearchEngine): TabSetActionCreators {
  engine.addReducers({tabSet});
  return {
    registerTab,
    updateActiveTab,
  };
}
