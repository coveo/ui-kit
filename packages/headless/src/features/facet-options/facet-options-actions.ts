import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {BooleanValue} from '@coveo/bueno';

export interface UpdateFacetOptionsActionCreatorPayload {
  /**
   * Whether facets should be returned in the same order they were requested.
   */
  freezeFacetOrder?: boolean;
}

/**
 * Updates options that affect facet reordering. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/build-a-search-ui/query-parameters#definitions-RestFacetOptions).
 * @param {Partial<FacetOptions>} facetOptions The options to update.
 */
export const updateFacetOptions = createAction(
  'facetOptions/update',
  (payload: UpdateFacetOptionsActionCreatorPayload) =>
    validatePayload(payload, {
      freezeFacetOrder: new BooleanValue({required: false}),
    })
);
