import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice.js';
import {
  ToggleExcludeFacetValuePayload,
  ToggleSelectFacetValuePayload,
} from '../regular-facet/regular-facet-actions.js';
import {
  toggleExcludeLocationFacetValue,
  toggleSelectLocationFacetValue,
} from './location-facet-actions.js';

export type {ToggleExcludeFacetValuePayload, ToggleSelectFacetValuePayload};

/**
 * The location facet action creators.
 */
export interface LocationFacetActionCreators {
  /**
   * Toggles the exclusion of a given location facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleExcludeLocationFacetValue(
    payload: ToggleExcludeFacetValuePayload
  ): PayloadAction<ToggleExcludeFacetValuePayload>;

  /**
   * Toggles the selection of a given location facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectLocationFacetValue(
    payload: ToggleSelectFacetValuePayload
  ): PayloadAction<ToggleSelectFacetValuePayload>;
}

/**
 * Loads the commerce facet set reducer and returns the available location facet action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the location facet action creators.
 */
export function loadLocationFacetActions(
  engine: CommerceEngine
): LocationFacetActionCreators {
  engine.addReducers({commerceFacetSet});
  return {
    toggleExcludeLocationFacetValue,
    toggleSelectLocationFacetValue,
  };
}
