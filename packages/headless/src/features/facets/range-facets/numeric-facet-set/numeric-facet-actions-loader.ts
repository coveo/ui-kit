import type {PayloadAction} from '@reduxjs/toolkit';
import type {CoreEngine} from '../../../../app/engine.js';
import {numericFacetSetReducer as numericFacetSet} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {
  deselectAllNumericFacetValues,
  type RegisterNumericFacetActionCreatorPayload,
  registerNumericFacet,
  type ToggleSelectNumericFacetValueActionCreatorPayload,
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  type UpdateNumericFacetSortCriterionActionCreatorPayload,
  type UpdateNumericFacetValuesActionCreatorPayload,
  updateNumericFacetSortCriterion,
  updateNumericFacetValues,
} from './numeric-facet-actions.js';

export type {
  RegisterNumericFacetActionCreatorPayload,
  ToggleSelectNumericFacetValueActionCreatorPayload,
  UpdateNumericFacetSortCriterionActionCreatorPayload,
  UpdateNumericFacetValuesActionCreatorPayload,
};

/**
 * The numeric facet action creators.
 *
 * @group Actions
 * @category NumericFacetSet
 */
export interface NumericFacetSetActionCreators {
  /**
   * Deselects all values of a numeric facet.
   *
   * @param facetId - The unique identifier of the facet (for example, "1").
   * @returns A dispatchable action.
   */
  deselectAllNumericFacetValues(facetId: string): PayloadAction<string>;

  /**
   * Registers a numeric facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerNumericFacet(
    payload: RegisterNumericFacetActionCreatorPayload
  ): PayloadAction<RegisterNumericFacetActionCreatorPayload>;

  /**
   * Toggles a numeric facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectNumericFacetValue(
    payload: ToggleSelectNumericFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectNumericFacetValueActionCreatorPayload>;

  /**
   * Toggles exclusion of a numeric facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleExcludeNumericFacetValue(
    payload: ToggleSelectNumericFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectNumericFacetValueActionCreatorPayload>;

  /**
   * Updates the sort criterion of a numeric facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateNumericFacetSortCriterion(
    payload: UpdateNumericFacetSortCriterionActionCreatorPayload
  ): PayloadAction<UpdateNumericFacetSortCriterionActionCreatorPayload>;

  /**
   * Updates numeric facet values.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateNumericFacetValues(
    payload: UpdateNumericFacetValuesActionCreatorPayload
  ): PayloadAction<UpdateNumericFacetValuesActionCreatorPayload>;
}

/**
 * Loads the `numericFacetSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category NumericFacetSet
 */
export function loadNumericFacetSetActions(
  engine: CoreEngine
): NumericFacetSetActionCreators {
  engine.addReducers({numericFacetSet});

  return {
    deselectAllNumericFacetValues,
    registerNumericFacet,
    toggleSelectNumericFacetValue,
    toggleExcludeNumericFacetValue,
    updateNumericFacetSortCriterion,
    updateNumericFacetValues,
  };
}
