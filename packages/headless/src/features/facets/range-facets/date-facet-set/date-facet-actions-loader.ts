import {PayloadAction} from '@reduxjs/toolkit';
import {dateFacetSet} from '../../../../app/reducers';
import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {
  deselectAllDateFacetValues,
  registerDateFacet,
  RegisterDateFacetActionCreatorPayload,
  toggleSelectDateFacetValue,
  ToggleSelectDateFacetValueActionCreatorPayload,
  updateDateFacetSortCriterion,
  UpdateDateFacetSortCriterionActionCreatorPayload,
  UpdateDateFacetValuesActionCreatorPayload,
  updateDateFacetValues,
} from './date-facet-actions';

export {
  RegisterDateFacetActionCreatorPayload,
  ToggleSelectDateFacetValueActionCreatorPayload,
  UpdateDateFacetSortCriterionActionCreatorPayload,
  UpdateDateFacetValuesActionCreatorPayload,
};

/**
 * The date facet set action creators.
 */
export interface DateFacetSetActionCreators {
  /**
   * Deselects all values of a date facet.
   *
   * @param facetId - The unique identifier of the facet (e.g., `"1"`).
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
   * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
   * @param values (DateFacetValue[]) The date facet values.
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
 */
export function loadDateFacetSetActions(
  engine: SearchEngine
): DateFacetSetActionCreators {
  engine.addReducers({dateFacetSet});

  return {
    deselectAllDateFacetValues,
    registerDateFacet,
    toggleSelectDateFacetValue,
    updateDateFacetSortCriterion,
    updateDateFacetValues,
  };
}
