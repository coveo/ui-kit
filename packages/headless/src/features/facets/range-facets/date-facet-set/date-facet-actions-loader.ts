import type {PayloadAction} from '@reduxjs/toolkit';
import type {CoreEngine} from '../../../../app/engine.js';
import {dateFacetSetReducer as dateFacetSet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import {
  deselectAllDateFacetValues,
  type RegisterDateFacetActionCreatorPayload,
  registerDateFacet,
  type ToggleSelectDateFacetValueActionCreatorPayload,
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
  type UpdateDateFacetSortCriterionActionCreatorPayload,
  type UpdateDateFacetValuesActionCreatorPayload,
  updateDateFacetSortCriterion,
  updateDateFacetValues,
} from './date-facet-actions.js';

export type {
  RegisterDateFacetActionCreatorPayload,
  ToggleSelectDateFacetValueActionCreatorPayload,
  UpdateDateFacetSortCriterionActionCreatorPayload,
  UpdateDateFacetValuesActionCreatorPayload,
};

/**
 * The date facet set action creators.
 *
 * @group Actions
 * @category DateFacetSet
 */
export interface DateFacetSetActionCreators {
  /**
   * Deselects all values of a date facet.
   *
   * @param facetId - The unique identifier of the facet (for example, `"1"`).
   * @returns A dispatchable action.
   */
  deselectAllDateFacetValues(facetId: string): PayloadAction<string>;

  /**
   * Registers a date facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerDateFacet(
    payload: RegisterDateFacetActionCreatorPayload
  ): PayloadAction<RegisterDateFacetActionCreatorPayload>;

  /**
   * Toggles a date facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectDateFacetValue(
    payload: ToggleSelectDateFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectDateFacetValueActionCreatorPayload>;

  /**
   * Toggles exclusion of a date facet value
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleExcludeDateFacetValue(
    payload: ToggleSelectDateFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectDateFacetValueActionCreatorPayload>;

  /**
   * Updates the sort criterion of a date facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateDateFacetSortCriterion(
    payload: UpdateDateFacetSortCriterionActionCreatorPayload
  ): PayloadAction<UpdateDateFacetSortCriterionActionCreatorPayload>;

  /**
   * Updates date facet values.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateDateFacetValues(
    payload: UpdateDateFacetValuesActionCreatorPayload
  ): PayloadAction<UpdateDateFacetValuesActionCreatorPayload>;
}

/**
 * Loads the `dateFacetSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category DateFacetSet
 */
export function loadDateFacetSetActions(
  engine: CoreEngine
): DateFacetSetActionCreators {
  engine.addReducers({dateFacetSet});

  return {
    deselectAllDateFacetValues,
    registerDateFacet,
    toggleSelectDateFacetValue,
    toggleExcludeDateFacetValue,
    updateDateFacetSortCriterion,
    updateDateFacetValues,
  };
}
