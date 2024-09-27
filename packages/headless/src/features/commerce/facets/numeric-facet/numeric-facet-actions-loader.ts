import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice.js';
import {
  ToggleExcludeNumericFacetValuePayload,
  ToggleSelectNumericFacetValuePayload,
  UpdateNumericFacetValuesPayload,
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateNumericFacetValues,
} from './numeric-facet-actions.js';

export type {
  ToggleSelectNumericFacetValuePayload,
  ToggleExcludeNumericFacetValuePayload,
  UpdateNumericFacetValuesPayload,
};

/**
 * The numeric facet action creators.
 */
export interface NumericFacetActionCreators {
  /**
   * Toggles the selection state of a given numeric facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectNumericFacetValue(
    payload: ToggleSelectNumericFacetValuePayload
  ): PayloadAction<ToggleSelectNumericFacetValuePayload>;

  /**
   * Toggles the exclusion state of a given numeric facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleExcludeNumericFacetValue(
    payload: ToggleExcludeNumericFacetValuePayload
  ): PayloadAction<ToggleExcludeNumericFacetValuePayload>;

  /**
   * Updates all values in a given numeric facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateNumericFacetValues(
    payload: UpdateNumericFacetValuesPayload
  ): PayloadAction<UpdateNumericFacetValuesPayload>;
}

/**
 * Loads the commerce facet set reducer and returns the available numeric facet action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the numeric facet action creators.
 */
export function loadNumericFacetActions(
  engine: CommerceEngine
): NumericFacetActionCreators {
  engine.addReducers({commerceFacetSet});
  return {
    toggleSelectNumericFacetValue,
    toggleExcludeNumericFacetValue,
    updateNumericFacetValues,
  };
}
