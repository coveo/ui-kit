import {PayloadAction} from '@reduxjs/toolkit';
import {facetSet} from '../../../app/reducers';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {
  deselectAllFacetValues,
  registerFacet,
  RegisterFacetActionCreatorPayload,
  toggleSelectFacetValue,
  ToggleSelectFacetValueActionCreatorPayload,
  updateFacetIsFieldExpanded,
  UpdateFacetIsFieldExpandedActionCreatorPayload,
  updateFacetNumberOfValues,
  UpdateFacetNumberOfValuesActionCreatorPayload,
  updateFacetSortCriterion,
  UpdateFacetSortCriterionActionCreatorPayload,
  updateFreezeCurrentValues,
  UpdateFreezeCurrentValuesActionCreatorPayload,
} from './facet-set-actions';

export {
  RegisterFacetActionCreatorPayload,
  ToggleSelectFacetValueActionCreatorPayload,
  UpdateFacetIsFieldExpandedActionCreatorPayload,
  UpdateFacetNumberOfValuesActionCreatorPayload,
  UpdateFacetSortCriterionActionCreatorPayload,
  UpdateFreezeCurrentValuesActionCreatorPayload,
};

/**
 * The facet set action creators.
 */
export interface FacetSetActionCreators {
  /**
   * Deselects all values of a facet.
   *
   * @param facetId - The unique identifier of the facet (e.g., `"1"`).
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
   * Toggles a facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectFacetValue(
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
}

/**
 * Loads the `facetSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadFacetSetActions(
  engine: SearchEngine
): FacetSetActionCreators {
  engine.addReducers({facetSet});

  return {
    deselectAllFacetValues,
    registerFacet,
    toggleSelectFacetValue,
    updateFacetIsFieldExpanded,
    updateFacetNumberOfValues,
    updateFacetSortCriterion,
    updateFreezeCurrentValues,
  };
}
