import {PayloadAction} from '@reduxjs/toolkit';
import {facetOptions} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  updateFacetOptions,
  UpdateFacetOptionsActionCreatorPayload,
} from './facet-options-actions';

export {UpdateFacetOptionsActionCreatorPayload};

/**
 * The facetOptions action creators.
 */
export interface FacetOptionsActionCreators {
  /**
   * Updates options that affect facet reordering. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/build-a-search-ui/query-parameters#definitions-RestFacetOptions).
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateFacetOptions(
    payload: UpdateFacetOptionsActionCreatorPayload
  ): PayloadAction<UpdateFacetOptionsActionCreatorPayload>;
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
  };
}
