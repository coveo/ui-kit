import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {facetOptionsReducer as facetOptions} from '../../features/facet-options/facet-options-slice.js';
import {
  updateFacetOptions,
  UpdateFacetOptionsActionCreatorPayload,
  EnableFacetActionCreatorPayload,
  DisableFacetActionCreatorPayload,
  enableFacet,
  disableFacet,
} from './facet-options-actions.js';

export type {
  UpdateFacetOptionsActionCreatorPayload,
  EnableFacetActionCreatorPayload,
  DisableFacetActionCreatorPayload,
};

/**
 * The facetOptions action creators.
 */
export interface FacetOptionsActionCreators {
  /**
   * Updates options that affect facet reordering. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/13#operation/searchUsingPost-facets).
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateFacetOptions(
    payload: UpdateFacetOptionsActionCreatorPayload
  ): PayloadAction<UpdateFacetOptionsActionCreatorPayload>;
  /**
   * Enables a facet. I.e., undoes the effects of `disable`.
   *
   * @param facetId - The unique identifier of the facet (e.g., "abcd").
   * @returns A dispatchable action.
   */
  enableFacet(facetId: string): PayloadAction<string>;
  /**
   * Disables a facet. I.e., prevents it from filtering results.
   *
   * @param facetId - The unique identifier of the facet (e.g., "1").
   * @returns A dispatchable action.
   */
  disableFacet(facetId: string): PayloadAction<string>;
}

/**
 * Loads the `facetOptions` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadFacetOptionsActions(
  engine: SearchEngine
): FacetOptionsActionCreators {
  engine.addReducers({facetOptions});

  return {
    updateFacetOptions,
    enableFacet,
    disableFacet,
  };
}
