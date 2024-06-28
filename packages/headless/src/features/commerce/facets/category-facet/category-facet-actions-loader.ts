import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  ToggleSelectCategoryFacetValueActionCreatorPayload,
  UpdateCategoryFacetNumberOfValuesActionCreatorPayload,
} from '../../../facets/category-facet-set/category-facet-set-actions';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice';
import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from './category-facet-actions';

export type {UpdateCategoryFacetNumberOfValuesActionCreatorPayload};

/**
 * The category facet action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface CategoryFacetSetActionCreators {
  /**
   * Toggles the selection of a category facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectCategoryFacetValue(
    payload: ToggleSelectCategoryFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectCategoryFacetValueActionCreatorPayload>;

  /**
   * Updates the number of values to request for a given category facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCategoryFacetNumberOfValues(
    payload: UpdateCategoryFacetNumberOfValuesActionCreatorPayload
  ): PayloadAction<UpdateCategoryFacetNumberOfValuesActionCreatorPayload>;
}

/**
 * Loads the commerce facet set reducer and returns the available category facet action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
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
