import {PayloadAction} from '@reduxjs/toolkit';
import {numericFacetSet} from '../../../../app/reducers';
import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {
  deselectAllNumericFacetValues,
  registerNumericFacet,
  RegisterNumericFacetActionCreatorPayload,
  toggleSelectNumericFacetValue,
  ToggleSelectNumericFacetValueActionCreatorPayload,
  updateNumericFacetSortCriterion,
  UpdateNumericFacetSortCriterionActionCreatorPayload,
  updateNumericFacetValues,
  UpdateNumericFacetValuesActionCreatorPayload,
} from './numeric-facet-actions';

export {
  RegisterNumericFacetActionCreatorPayload,
  ToggleSelectNumericFacetValueActionCreatorPayload,
  UpdateNumericFacetSortCriterionActionCreatorPayload,
  UpdateNumericFacetValuesActionCreatorPayload,
};

/**
 * The numeric facet action creators.
 */
export interface NumericFacetSetActionCreators {
  /**
   * Deselects all values of a numeric facet.
   *
   * @param facetId - The unique identifier of the facet (e.g., "1").
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
   * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
   * @param values (NumericFacetValue[]) The numeric facet values.
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
 */
export function loadNumericFacetSetActions(
  engine: SearchEngine
): NumericFacetSetActionCreators {
  engine.addReducers({numericFacetSet});

  return {
    deselectAllNumericFacetValues,
    registerNumericFacet,
    toggleSelectNumericFacetValue,
    updateNumericFacetSortCriterion,
    updateNumericFacetValues,
  };
}
