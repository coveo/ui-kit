import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice';
import {
  ToggleExcludeDateFacetValuePayload,
  ToggleSelectDateFacetValuePayload,
  UpdateDateFacetValuesPayload,
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
  updateDateFacetValues,
} from './date-facet-actions';

/**
 * The date facet action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export type {
  ToggleSelectDateFacetValuePayload,
  ToggleExcludeDateFacetValuePayload,
  UpdateDateFacetValuesPayload,
};

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
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the date facet action creators.
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
