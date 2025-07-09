import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice.js';
import {
  type ToggleSelectLocationFacetValuePayload,
  toggleSelectLocationFacetValue,
} from './location-facet-actions.js';

export type {ToggleSelectLocationFacetValuePayload};

/**
 * The location facet action creators.
 */
export interface LocationFacetActionCreators {
  /**
   * Toggles the selection of a given location facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectLocationFacetValue(
    payload: ToggleSelectLocationFacetValuePayload
  ): PayloadAction<ToggleSelectLocationFacetValuePayload>;
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
    toggleSelectLocationFacetValue,
  };
}
