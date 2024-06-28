import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice';
import {
  DeselectAllValuesInCoreFacetActionCreatorPayload,
  UpdateCoreFacetFreezeCurrentValuesActionCreatorPayload,
  UpdateCoreFacetIsFieldExpandedActionCreatorPayload,
  UpdateCoreFacetNumberOfValuesActionCreatorPayload,
  UpdateAutoSelectionForAllCoreFacetsActionCreatorPayload,
  deselectAllValuesInCoreFacet,
  updateCoreFacetFreezeCurrentValues,
  updateCoreFacetIsFieldExpanded,
  updateCoreFacetNumberOfValues,
  updateAutoSelectionForAllCoreFacets,
  clearAllCoreFacets,
} from './core-facet-actions';

export type {
  DeselectAllValuesInCoreFacetActionCreatorPayload,
  UpdateAutoSelectionForAllCoreFacetsActionCreatorPayload,
  UpdateCoreFacetFreezeCurrentValuesActionCreatorPayload,
  UpdateCoreFacetIsFieldExpandedActionCreatorPayload,
  UpdateCoreFacetNumberOfValuesActionCreatorPayload,
};

/**
 * The core facet action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
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
    payload: DeselectAllValuesInCoreFacetActionCreatorPayload
  ): PayloadAction<DeselectAllValuesInCoreFacetActionCreatorPayload>;

  /**
   * Updates the auto selection state of every facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateAutoSelectionForAllCoreFacets(
    payload: UpdateAutoSelectionForAllCoreFacetsActionCreatorPayload
  ): PayloadAction<UpdateAutoSelectionForAllCoreFacetsActionCreatorPayload>;

  /**
   * Update the freeze current values state of a given facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCoreFacetFreezeCurrentValues(
    payload: UpdateCoreFacetFreezeCurrentValuesActionCreatorPayload
  ): PayloadAction<UpdateCoreFacetFreezeCurrentValuesActionCreatorPayload>;

  /**
   * Updates the expanded state of a given facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCoreFacetIsFieldExpanded(
    payload: UpdateCoreFacetIsFieldExpandedActionCreatorPayload
  ): PayloadAction<UpdateCoreFacetIsFieldExpandedActionCreatorPayload>;

  /**
   * Updates the number of values to request for a given facet.
   *
   * **Note:** This action has no effect on category facets, which have their own action for this purpose.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCoreFacetNumberOfValues(
    payload: UpdateCoreFacetNumberOfValuesActionCreatorPayload
  ): PayloadAction<UpdateCoreFacetNumberOfValuesActionCreatorPayload>;
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
