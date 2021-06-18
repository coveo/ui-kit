import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine';
import {searchHub} from '../../app/reducers';
import {setSearchHub} from './search-hub-actions';

/**
 * The search hub action creators.
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
 */
export function loadSearchHubActions(
  engine: CoreEngine
): SearchHubActionCreators {
  engine.addReducers({searchHub});

  return {setSearchHub};
}
