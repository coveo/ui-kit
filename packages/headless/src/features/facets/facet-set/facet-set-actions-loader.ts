import type {PayloadAction} from '@reduxjs/toolkit';
import type {SearchEngine} from '../../../app/search-engine/search-engine.js';
import {facetSetReducer as facetSet} from '../../../features/facets/facet-set/facet-set-slice.js';
import {
  type UpdateFacetAutoSelectionActionCreatorPayload,
  updateFacetAutoSelection,
} from '../generic/facet-actions.js';
import {
  deselectAllFacetValues,
  type RegisterFacetActionCreatorPayload,
  registerFacet,
  type ToggleSelectFacetValueActionCreatorPayload,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  type UpdateFacetIsFieldExpandedActionCreatorPayload,
  type UpdateFacetNumberOfValuesActionCreatorPayload,
  type UpdateFacetSortCriterionActionCreatorPayload,
  type UpdateFreezeCurrentValuesActionCreatorPayload,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
  updateFacetSortCriterion,
  updateFreezeCurrentValues,
} from './facet-set-actions.js';

export type {
  RegisterFacetActionCreatorPayload,
  ToggleSelectFacetValueActionCreatorPayload,
  UpdateFacetIsFieldExpandedActionCreatorPayload,
  UpdateFacetNumberOfValuesActionCreatorPayload,
  UpdateFacetSortCriterionActionCreatorPayload,
  UpdateFreezeCurrentValuesActionCreatorPayload,
  UpdateFacetAutoSelectionActionCreatorPayload,
};

/**
 * The facet set action creators.
 *
 * @group Actions
 * @category FacetSet
 */
export interface FacetSetActionCreators {
  /**
   * Deselects all values of a facet.
   *
   * @param facetId - The unique identifier of the facet (for example, `"1"`).
   * @returns A dispatchable action.
   */
  deselectAllFacetValues(facetId: string): PayloadAction<string>;

  /**
   * Registers a facet in the facet set.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerFacet(
    payload: RegisterFacetActionCreatorPayload
  ): PayloadAction<RegisterFacetActionCreatorPayload>;

  /**
   * Toggles a facet value. If the value does not exist, it is added.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectFacetValue(
    payload: ToggleSelectFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectFacetValueActionCreatorPayload>;

  /**
   * Excludes a facet value. If the value does not exist, it is added.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleExcludeFacetValue(
    payload: ToggleSelectFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectFacetValueActionCreatorPayload>;

  /**
   * Whether to expand (show more values than initially configured) or shrink down the facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateFacetIsFieldExpanded(
    payload: UpdateFacetIsFieldExpandedActionCreatorPayload
  ): PayloadAction<UpdateFacetIsFieldExpandedActionCreatorPayload>;

  /**
   * Updates the number of values of a facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateFacetNumberOfValues(
    payload: UpdateFacetNumberOfValuesActionCreatorPayload
  ): PayloadAction<UpdateFacetNumberOfValuesActionCreatorPayload>;

  /**
   * Updates the sort criterion of a facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateFacetSortCriterion(
    payload: UpdateFacetSortCriterionActionCreatorPayload
  ): PayloadAction<UpdateFacetSortCriterionActionCreatorPayload>;

  /**
   * Updates the updateFreezeCurrentValues flag of a facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateFreezeCurrentValues(
    payload: UpdateFreezeCurrentValuesActionCreatorPayload
  ): PayloadAction<UpdateFreezeCurrentValuesActionCreatorPayload>;

  /**
   * Updates the preventAutoSelect flag of all facets
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateFacetAutoSelection(
    payload: UpdateFacetAutoSelectionActionCreatorPayload
  ): PayloadAction<UpdateFacetAutoSelectionActionCreatorPayload>;
}

/**
 * Loads the `facetSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category FacetSet
 */
export function loadFacetSetActions(
  engine: SearchEngine
): FacetSetActionCreators {
  engine.addReducers({facetSet});

  return {
    deselectAllFacetValues,
    registerFacet,
    toggleSelectFacetValue,
    toggleExcludeFacetValue,
    updateFacetIsFieldExpanded,
    updateFacetNumberOfValues,
    updateFacetSortCriterion,
    updateFreezeCurrentValues,
    updateFacetAutoSelection,
  };
}
