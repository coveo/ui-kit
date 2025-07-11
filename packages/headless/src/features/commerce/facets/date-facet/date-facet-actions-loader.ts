import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice.js';
import {
  type ToggleExcludeDateFacetValuePayload,
  type ToggleSelectDateFacetValuePayload,
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
  type UpdateDateFacetValuesPayload,
  updateDateFacetValues,
} from './date-facet-actions.js';

/**
 * The date facet action creators.
 */
export type {
  ToggleSelectDateFacetValuePayload,
  ToggleExcludeDateFacetValuePayload,
  UpdateDateFacetValuesPayload,
};

/**
 * The date facet action creators.
 *
 * @group Actions
 * @category DateFacet
 */
export interface DateFacetActionCreators {
  /**
   * Toggles the selection state of a given date facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectDateFacetValue(
    payload: ToggleSelectDateFacetValuePayload
  ): PayloadAction<ToggleSelectDateFacetValuePayload>;

  /**
   * Toggles the exclusion state of a given date facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleExcludeDateFacetValue(
    payload: ToggleExcludeDateFacetValuePayload
  ): PayloadAction<ToggleExcludeDateFacetValuePayload>;

  /**
   * Updates all values in a given date facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateDateFacetValues(
    payload: UpdateDateFacetValuesPayload
  ): PayloadAction<UpdateDateFacetValuesPayload>;
}

/**
 * Loads the commerce facet set reducer and returns the available date facet action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the date facet action creators.
 *
 * @group Actions
 * @category DateFacet
 */
export function loadDateFacetActions(
  engine: CommerceEngine
): DateFacetActionCreators {
  engine.addReducers({commerceFacetSet});
  return {
    toggleSelectDateFacetValue,
    toggleExcludeDateFacetValue,
    updateDateFacetValues,
  };
}
