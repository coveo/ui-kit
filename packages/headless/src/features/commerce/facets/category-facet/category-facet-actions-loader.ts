import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice.js';
import {
  ToggleSelectCategoryFacetValuePayload,
  UpdateCategoryFacetNumberOfValuesPayload,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from './category-facet-actions.js';

export type {
  ToggleSelectCategoryFacetValuePayload,
  UpdateCategoryFacetNumberOfValuesPayload,
};

/**
 * The category facet action creators.
 */
export interface CategoryFacetSetActionCreators {
  /**
   * Toggles the selection of a given category facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectCategoryFacetValue(
    payload: ToggleSelectCategoryFacetValuePayload
  ): PayloadAction<ToggleSelectCategoryFacetValuePayload>;

  /**
   * Updates the number of values to request for a given category facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCategoryFacetNumberOfValues(
    payload: UpdateCategoryFacetNumberOfValuesPayload
  ): PayloadAction<UpdateCategoryFacetNumberOfValuesPayload>;
}

/**
 * Loads the commerce facet set reducer and returns the available category facet action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the category facet action creators.
 */
export function loadCategoryFacetSetActions(
  engine: CommerceEngine
): CategoryFacetSetActionCreators {
  engine.addReducers({commerceFacetSet});
  return {
    toggleSelectCategoryFacetValue,
    updateCategoryFacetNumberOfValues,
  };
}
