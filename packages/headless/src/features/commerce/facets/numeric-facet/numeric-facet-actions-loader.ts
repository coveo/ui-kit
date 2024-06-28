import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {
  ToggleSelectNumericFacetValueActionCreatorPayload,
  UpdateNumericFacetValuesActionCreatorPayload,
} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice';
import {
  ToggleExcludeNumericFacetValueActionCreatorPayload,
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateNumericFacetValues,
} from './numeric-facet-actions';

export type {
  ToggleSelectNumericFacetValueActionCreatorPayload,
  ToggleExcludeNumericFacetValueActionCreatorPayload,
  UpdateNumericFacetValuesActionCreatorPayload,
};

/**
 * The numeric facet action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface NumericFacetActionCreators {
  /**
   * Toggles the selection state of a given numeric facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleSelectNumericFacetValue(
    payload: ToggleSelectNumericFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectNumericFacetValueActionCreatorPayload>;

  /**
   * Toggles the exclusion state of a given numeric facet value.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  toggleExcludeNumericFacetValue(
    payload: ToggleExcludeNumericFacetValueActionCreatorPayload
  ): PayloadAction<ToggleExcludeNumericFacetValueActionCreatorPayload>;

  /**
   * Updates all values in a given numeric facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateNumericFacetValues(
    payload: UpdateNumericFacetValuesActionCreatorPayload
  ): PayloadAction<UpdateNumericFacetValuesActionCreatorPayload>;
}

/**
 * Loads the commerce facet set reducer and returns the available numeric facet action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the numeric facet action creators.
 */
export function loadNumericFacetActions(
  engine: CommerceEngine
): NumericFacetActionCreators {
  engine.addReducers({commerceFacetSet});
  return {
    toggleSelectNumericFacetValue,
    toggleExcludeNumericFacetValue,
    updateNumericFacetValues,
  };
}
