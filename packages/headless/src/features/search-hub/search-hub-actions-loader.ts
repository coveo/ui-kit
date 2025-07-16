import type {PayloadAction} from '@reduxjs/toolkit';
import type {CoreEngine} from '../../app/engine.js';
import {searchHubReducer as searchHub} from '../../features/search-hub/search-hub-slice.js';
import {setSearchHub} from './search-hub-actions.js';

/**
 * The search hub action creators.
 *
 * @group Actions
 * @category SearchHub
 */
export interface SearchHubActionCreators {
  /**
   * Sets the search hub.
   *
   * @param searchHub - The new search hub (may be empty).
   * @returns A dispatchable action.
   */
  setSearchHub(searchHub: string): PayloadAction<string>;
}

/**
 * Loads the `searchHub` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category SearchHub
 */
export function loadSearchHubActions(
  engine: CoreEngine
): SearchHubActionCreators {
  engine.addReducers({searchHub});

  return {setSearchHub};
}
