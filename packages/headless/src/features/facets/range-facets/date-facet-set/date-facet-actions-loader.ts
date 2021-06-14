import {PayloadAction} from '@reduxjs/toolkit';
import {Engine} from '../../../../app/headless-engine';
import {dateFacetSet} from '../../../../app/reducers';
import {
  deselectAllDateFacetValues,
  registerDateFacet,
  RegisterDateFacetActionCreatorPayload,
  toggleSelectDateFacetValue,
  ToggleSelectDateFacetValueActionCreatorPayload,
  updateDateFacetSortCriterion,
  UpdateDateFacetSortCriterionActionCreatorPayload,
  toggleSingleSelectDateFacetValue,
} from './date-facet-actions';

export {
  RegisterDateFacetActionCreatorPayload,
  ToggleSelectDateFacetValueActionCreatorPayload,
  UpdateDateFacetSortCriterionActionCreatorPayload,
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
   * Toggles a date facet value ensuring other values are deselected.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSingleSelectDateFacetValue(
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
}

/**
 * Loads the `dateFacetSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadDateFacetSetActions(
  engine: Engine<object>
): DateFacetSetActionCreators {
  engine.addReducers({dateFacetSet});

  return {
    deselectAllDateFacetValues,
    registerDateFacet,
    toggleSelectDateFacetValue,
    updateDateFacetSortCriterion,
    toggleSingleSelectDateFacetValue,
  };
}
