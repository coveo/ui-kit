import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {
  ToggleSelectAutomaticFacetValueActionCreatorPayload,
  deselectAllAutomaticFacetValues,
  setDesiredCount,
  toggleSelectAutomaticFacetValue,
} from './automatic-facet-set-actions';
import {automaticFacetSetReducer as automaticFacetSet} from './automatic-facet-set-slice';

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

  /**
   * Deselects all values of a facet.
   *
   * @param field - The unique identifier of the facet (e.g., `"1"`).
   * @returns A dispatchable action.
   */
  deselectAllAutomaticFacetValues(field: string): PayloadAction<string>;

  /**
   * Toggles a facet value. If the value does not exist, it is added.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectAutomaticFacetValue(
    payload: ToggleSelectAutomaticFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectAutomaticFacetValueActionCreatorPayload>;
}

/**
 * Loads the automatic facet actions and adds the reducer to the search engine.
 *
 * @param engine - The headless search engine.
 * @returns An object holding the automatic facets action creators.
 */
export function loadAutomaticFacetSetActions(
  engine: SearchEngine
): AutomaticFacetsActionCreators {
  engine.addReducers({automaticFacetSet});

  return {
    setDesiredCount,
    deselectAllAutomaticFacetValues,
    toggleSelectAutomaticFacetValue,
  };
}
