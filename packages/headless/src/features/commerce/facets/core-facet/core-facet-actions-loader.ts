import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice.js';
import {
  DeselectAllValuesInCoreFacetPayload,
  UpdateCoreFacetFreezeCurrentValuesPayload,
  UpdateCoreFacetIsFieldExpandedPayload,
  UpdateCoreFacetNumberOfValuesPayload,
  UpdateAutoSelectionForAllCoreFacetsPayload,
  deselectAllValuesInCoreFacet,
  updateCoreFacetFreezeCurrentValues,
  updateCoreFacetIsFieldExpanded,
  updateCoreFacetNumberOfValues,
  updateAutoSelectionForAllCoreFacets,
  clearAllCoreFacets,
} from './core-facet-actions.js';

export type {
  DeselectAllValuesInCoreFacetPayload,
  UpdateAutoSelectionForAllCoreFacetsPayload,
  UpdateCoreFacetFreezeCurrentValuesPayload,
  UpdateCoreFacetIsFieldExpandedPayload,
  UpdateCoreFacetNumberOfValuesPayload,
};

/**
 * The core facet action creators.
 */
export interface CoreFacetActionsCreators {
  /**
   * Clears all facets.
   *
   * @returns A dispatchable action.
   */
  clearAllCoreFacets(): PayloadAction<void>;

  /**
   * Deselects all values in a given facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  deselectAllValuesInCoreFacet(
    payload: DeselectAllValuesInCoreFacetPayload
  ): PayloadAction<DeselectAllValuesInCoreFacetPayload>;

  /**
   * Updates the auto selection state of every facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateAutoSelectionForAllCoreFacets(
    payload: UpdateAutoSelectionForAllCoreFacetsPayload
  ): PayloadAction<UpdateAutoSelectionForAllCoreFacetsPayload>;

  /**
   * Update the freeze current values state of a given facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCoreFacetFreezeCurrentValues(
    payload: UpdateCoreFacetFreezeCurrentValuesPayload
  ): PayloadAction<UpdateCoreFacetFreezeCurrentValuesPayload>;

  /**
   * Updates the expanded state of a given facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCoreFacetIsFieldExpanded(
    payload: UpdateCoreFacetIsFieldExpandedPayload
  ): PayloadAction<UpdateCoreFacetIsFieldExpandedPayload>;

  /**
   * Updates the number of values to request for a given facet.
   *
   * **Note:** This action has no effect on category facets, which have their own action for this purpose.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCoreFacetNumberOfValues(
    payload: UpdateCoreFacetNumberOfValuesPayload
  ): PayloadAction<UpdateCoreFacetNumberOfValuesPayload>;
}

/**
 * Loads the commerce facet set reducer and returns the available core facet action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the core facet action creators.
 */
export function loadCoreFacetActions(
  engine: CommerceEngine
): CoreFacetActionsCreators {
  engine.addReducers({commerceFacetSet});
  return {
    clearAllCoreFacets,
    deselectAllValuesInCoreFacet,
    updateAutoSelectionForAllCoreFacets,
    updateCoreFacetFreezeCurrentValues,
    updateCoreFacetIsFieldExpanded,
    updateCoreFacetNumberOfValues,
  };
}
