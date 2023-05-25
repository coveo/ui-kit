import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../features/facets/category-facet-set/category-facet-set-slice';
import {
  UpdateFacetAutoSelectionActionCreatorPayload,
  updateFacetAutoSelection,
} from '../generic/facet-actions';
import {
  deselectAllCategoryFacetValues,
  registerCategoryFacet,
  RegisterCategoryFacetActionCreatorPayload,
  toggleSelectCategoryFacetValue,
  ToggleSelectCategoryFacetValueActionCreatorPayload,
  updateCategoryFacetNumberOfValues,
  UpdateCategoryFacetNumberOfValuesActionCreatorPayload,
  updateCategoryFacetSortCriterion,
  UpdateCategoryFacetSortCriterionActionCreatorPayload,
} from './category-facet-set-actions';

export type {
  RegisterCategoryFacetActionCreatorPayload,
  ToggleSelectCategoryFacetValueActionCreatorPayload,
  UpdateCategoryFacetNumberOfValuesActionCreatorPayload,
  UpdateCategoryFacetSortCriterionActionCreatorPayload,
  UpdateFacetAutoSelectionActionCreatorPayload,
};

/**
 * The category facet set action creators.
 */
export interface CategoryFacetSetActionCreators {
  /**
   * Deselects all values of a category facet.
   *
   * @param facetId - The unique identifier of the facet (e.g., "1").
   * @returns A dispatchable action.
   */
  deselectAllCategoryFacetValues(facetId: string): PayloadAction<string>;

  /**
   * Registers a category facet in the category facet set.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerCategoryFacet(
    payload: RegisterCategoryFacetActionCreatorPayload
  ): PayloadAction<RegisterCategoryFacetActionCreatorPayload>;

  /**
   * Toggles a category facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectCategoryFacetValue(
    payload: ToggleSelectCategoryFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectCategoryFacetValueActionCreatorPayload>;

  /**
   * Updates the number of values of a category facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCategoryFacetNumberOfValues(
    payload: UpdateCategoryFacetNumberOfValuesActionCreatorPayload
  ): PayloadAction<UpdateCategoryFacetNumberOfValuesActionCreatorPayload>;

  /**
   * Updates the the sort criterion for the category facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCategoryFacetSortCriterion(
    payload: UpdateCategoryFacetSortCriterionActionCreatorPayload
  ): PayloadAction<UpdateCategoryFacetSortCriterionActionCreatorPayload>;

  /**
   * Updates the preventAutoSelect flag of all facets.
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateFacetAutoSelection(
    payload: UpdateFacetAutoSelectionActionCreatorPayload
  ): PayloadAction<UpdateFacetAutoSelectionActionCreatorPayload>;
}

/**
 * Loads the `categoryFacetSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadCategoryFacetSetActions(
  engine: SearchEngine
): CategoryFacetSetActionCreators {
  engine.addReducers({categoryFacetSet});

  return {
    deselectAllCategoryFacetValues,
    registerCategoryFacet,
    toggleSelectCategoryFacetValue,
    updateCategoryFacetNumberOfValues,
    updateCategoryFacetSortCriterion,
    updateFacetAutoSelection,
  };
}
