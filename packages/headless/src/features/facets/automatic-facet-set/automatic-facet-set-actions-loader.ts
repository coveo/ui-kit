import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {AutomaticFacetGeneratorOptions} from '../../../controllers/facets/automatic-facet-generator/headless-automatic-facet-generator-options';
import {
  ToggleSelectAutomaticFacetValueActionCreatorPayload,
  setOptions,
  deselectAllAutomaticFacetValues,
  toggleSelectAutomaticFacetValue,
} from './automatic-facet-set-actions';
import {automaticFacetSetReducer as automaticFacetSet} from './automatic-facet-set-slice';

/**
 * The action creators to manage automatic facets.
 */
export interface AutomaticFacetsActionCreators {
  /**
   * Sets the options of the automatic facet generator.
   *
   * @param options - Options of the automatic facet generator containing both the desiredCount and the numberOfValues.
   * @returns A dispatchable action.
   */
  setOptions(
    options: Partial<AutomaticFacetGeneratorOptions>
  ): PayloadAction<Partial<AutomaticFacetGeneratorOptions>>;

  /**
   * Deselects all values of an automatic facet.
   *
   * @param field - The field of the automatic facet.
   * @returns A dispatchable action.
   */
  deselectAllAutomaticFacetValues(field: string): PayloadAction<string>;

  /**
   * Toggles an automatic facet value.
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
    setOptions,
    deselectAllAutomaticFacetValues,
    toggleSelectAutomaticFacetValue,
  };
}
