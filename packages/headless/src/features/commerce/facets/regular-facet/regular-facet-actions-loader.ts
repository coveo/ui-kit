import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice.js';
import {
  type ToggleExcludeFacetValuePayload,
  type ToggleSelectFacetValuePayload,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from './regular-facet-actions.js';

export type {ToggleExcludeFacetValuePayload, ToggleSelectFacetValuePayload};

/**
 * The regular facet action creators.
 *
 * @group Actions
 * @category RegularFacet
 */
export interface RegularFacetActionCreators {
  /**
   * Toggles the exclusion of a given regular facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleExcludeFacetValue(
    payload: ToggleExcludeFacetValuePayload
  ): PayloadAction<ToggleExcludeFacetValuePayload>;

  /**
   * Toggles the selection of a given regular facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectFacetValue(
    payload: ToggleSelectFacetValuePayload
  ): PayloadAction<ToggleSelectFacetValuePayload>;
}

/**
 * Loads the commerce facet set reducer and returns the available regular facet action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the regular facet action creators.
 *
 * @group Actions
 * @category RegularFacet
 */
export function loadRegularFacetActions(
  engine: CommerceEngine
): RegularFacetActionCreators {
  engine.addReducers({commerceFacetSet});
  return {
    toggleExcludeFacetValue,
    toggleSelectFacetValue,
  };
}
