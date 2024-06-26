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
 * The core facet set action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface CoreFacetActionsCreators {
  clearAllCoreFacets(): PayloadAction<void>;
  /**
   * Deselects all values of a facet.
   *
   * @param payload - The action creator payload.
   */
  deselectAllValuesInCoreFacet(
    payload: DeselectAllValuesInCoreFacetActionCreatorPayload
  ): PayloadAction<DeselectAllValuesInCoreFacetActionCreatorPayload>;

  /**
   * Updates the auto selection state of every facet.
   *
   * @param payload - The action creator payload.
   */
  updateAutoSelectionForAllCoreFacets(
    payload: UpdateAutoSelectionForAllCoreFacetsActionCreatorPayload
  ): PayloadAction<UpdateAutoSelectionForAllCoreFacetsActionCreatorPayload>;

  /**
   * Update the freeze current values state of a facet.
   *
   * @param payload - The action creator payload.
   */
  updateCoreFacetFreezeCurrentValues(
    payload: UpdateCoreFacetFreezeCurrentValuesActionCreatorPayload
  ): PayloadAction<UpdateCoreFacetFreezeCurrentValuesActionCreatorPayload>;

  /**
   * Updates the expanded state of a facet.
   *
   * @param payload - The action creator payload.
   */
  updateCoreFacetIsFieldExpanded(
    payload: UpdateCoreFacetIsFieldExpandedActionCreatorPayload
  ): PayloadAction<UpdateCoreFacetIsFieldExpandedActionCreatorPayload>;

  /**
   * Updates the number of values to request for a facet.
   *
   * @param payload - The action creator payload.
   */
  updateCoreFacetNumberOfValues(
    payload: UpdateCoreFacetNumberOfValuesActionCreatorPayload
  ): PayloadAction<UpdateCoreFacetNumberOfValuesActionCreatorPayload>;
}

/**
 * Loads the commerce facet set reducer and returns the possible core facet actions.
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
