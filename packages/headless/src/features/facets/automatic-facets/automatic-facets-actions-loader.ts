import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {setDesiredCount} from './automatic-facets-actions';
import {automaticFacetsReducer as automaticFacets} from './automatic-facets-slice';

/**
 * The action creators to manage automatic facets.
 */
export interface AutomaticFacetsActionCreators {
  /**
   * Sets the desired count of automatic facets.
   *
   * @param desiredCount - Desired count of automatic facets.
   * @returns A dispatchable action.
   */
  setDesiredCount(desiredCount: number): PayloadAction<number>;
}

/**
 * Loads the automatic facet actions and adds the reducer to the search engine.
 *
 * @param engine - The headless search engine.
 * @returns An object holding the automatic facets action creators.
 */
export function loadAutomaticFacetsActions(
  engine: SearchEngine
): AutomaticFacetsActionCreators {
  engine.addReducers({automaticFacets});

  return {
    setDesiredCount,
  };
}
