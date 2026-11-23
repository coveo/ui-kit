import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {withDeprecationWarning} from '../../../../utils/deprecation.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice.js';
import {
  clearAllCoreFacets,
  type DeselectAllValuesInCoreFacetPayload,
  deleteAllCoreFacets,
  deselectAllValuesInCoreFacet,
  type UpdateAutoSelectionForAllCoreFacetsPayload,
  type UpdateCoreFacetFreezeCurrentValuesPayload,
  type UpdateCoreFacetIsFieldExpandedPayload,
  type UpdateCoreFacetNumberOfValuesPayload,
  updateAutoSelectionForAllCoreFacets,
  updateCoreFacetFreezeCurrentValues,
  updateCoreFacetIsFieldExpanded,
  updateCoreFacetNumberOfValues,
} from './core-facet-actions.js';

export type {
  DeselectAllValuesInCoreFacetPayload,
  UpdateAutoSelectionForAllCoreFacetsPayload,
  UpdateCoreFacetFreezeCurrentValuesPayload,
  UpdateCoreFacetIsFieldExpandedPayload,
  UpdateCoreFacetNumberOfValuesPayload,
};

/**
 * The core facet action creators.
 *
 * @group Actions
 * @category CategoryFacet
 */
export interface CoreFacetActionsCreators {
  /**
   * Deselects all values in every facet.
   *
   * @returns A dispatchable action.
   */
  clearAllCoreFacets(): PayloadAction<void>;

  /**
   * Deletes all facets in the state.
   */
  deleteAllCoreFacets(): PayloadAction<void>;

  /**
   * Deselects all values in a given facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  deselectAllValuesInCoreFacet(
    payload: DeselectAllValuesInCoreFacetPayload
  ): PayloadAction<DeselectAllValuesInCoreFacetPayload>;

  /**
   * Updates the auto selection state of every facet.
   *
   * @deprecated The Commerce API has never used the `preventAutoSelect` request property that this action creator
   * sets, so it has no effect, and it has no replacement. This action creator will be removed in the next major
   * version.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateAutoSelectionForAllCoreFacets(
    payload: UpdateAutoSelectionForAllCoreFacetsPayload
  ): PayloadAction<UpdateAutoSelectionForAllCoreFacetsPayload>;

  /**
   * Update the freeze current values state of a given facet.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCoreFacetFreezeCurrentValues(
    payload: UpdateCoreFacetFreezeCurrentValuesPayload
  ): PayloadAction<UpdateCoreFacetFreezeCurrentValuesPayload>;

  /**
   * Updates the expanded state of a given facet.
   *
   * @deprecated Use the `showMoreValues` and `showLessValues` methods of the facet controller instead. The Commerce
   * API ignores the `isFieldExpanded` request property that this action creator sets. This action creator will be
   * removed in the next major version.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCoreFacetIsFieldExpanded(
    payload: UpdateCoreFacetIsFieldExpandedPayload
  ): PayloadAction<UpdateCoreFacetIsFieldExpandedPayload>;

  /**
   * Updates the number of values to request for a given facet.
   *
   * **Note:** This action has no effect on category facets, which have their own action for this purpose.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateCoreFacetNumberOfValues(
    payload: UpdateCoreFacetNumberOfValuesPayload
  ): PayloadAction<UpdateCoreFacetNumberOfValuesPayload>;
}

/**
 * Loads the commerce facet set reducer and returns the available core facet action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the core facet action creators.
 *
 * @group Actions
 * @category CategoryFacet
 */
export function loadCoreFacetActions(engine: CommerceEngine): CoreFacetActionsCreators {
  engine.addReducers({commerceFacetSet});
  return {
    clearAllCoreFacets,
    deleteAllCoreFacets,
    deselectAllValuesInCoreFacet,
    updateAutoSelectionForAllCoreFacets: withDeprecationWarning(
      engine.logger,
      updateAutoSelectionForAllCoreFacets,
      'The commerce `updateAutoSelectionForAllCoreFacets` action creator',
      'Remove the call: the Commerce API has never used `preventAutoSelect`, so the action has no effect.'
    ),
    updateCoreFacetFreezeCurrentValues,
    updateCoreFacetIsFieldExpanded: withDeprecationWarning(
      engine.logger,
      updateCoreFacetIsFieldExpanded,
      'The commerce `updateCoreFacetIsFieldExpanded` action creator',
      'Use the `showMoreValues` and `showLessValues` methods of the facet controller instead: the Commerce API ignores `isFieldExpanded`.'
    ),
    updateCoreFacetNumberOfValues,
  };
}
