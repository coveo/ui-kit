import {z} from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import type {
  UpdateFacetIsFieldExpandedActionCreatorPayload,
  UpdateFacetNumberOfValuesActionCreatorPayload,
  UpdateFreezeCurrentValuesActionCreatorPayload,
} from '../../../facets/facet-set/facet-set-actions.js';
import type {UpdateFacetAutoSelectionActionCreatorPayload} from '../../../facets/generic/facet-actions.js';

export type UpdateCoreFacetNumberOfValuesPayload =
  UpdateFacetNumberOfValuesActionCreatorPayload;

export const updateCoreFacetNumberOfValues = createAction(
  'commerce/facets/core/updateNumberOfValues',
  (payload: UpdateCoreFacetNumberOfValuesPayload) =>
    validatePayload(
      payload,
      z.object({
        facetId: requiredNonEmptyString,
        numberOfValues: z.number().check(z.minimum(1)),
      })
    )
);

export type UpdateCoreFacetIsFieldExpandedPayload =
  UpdateFacetIsFieldExpandedActionCreatorPayload;

export const updateCoreFacetIsFieldExpanded = createAction(
  'commerce/facets/core/updateIsFieldExpanded',
  (payload: UpdateCoreFacetIsFieldExpandedPayload) =>
    validatePayload(
      payload,
      z.object({
        facetId: requiredNonEmptyString,
        isFieldExpanded: z.boolean(),
      })
    )
);

export const clearAllCoreFacets = createAction('commerce/facets/core/clearAll');

export const deleteAllCoreFacets = createAction(
  'commerce/facets/core/deleteAll'
);

export type DeselectAllValuesInCoreFacetPayload = {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;
};

export const deselectAllValuesInCoreFacet = createAction(
  'commerce/facets/core/deselectAllValues',
  (payload: DeselectAllValuesInCoreFacetPayload) =>
    validatePayload(
      payload,
      z.object({
        facetId: requiredNonEmptyString,
      })
    )
);

export type UpdateCoreFacetFreezeCurrentValuesPayload =
  UpdateFreezeCurrentValuesActionCreatorPayload;

export const updateCoreFacetFreezeCurrentValues = createAction(
  'commerce/facets/core/updateFreezeCurrentValues',
  (payload: UpdateCoreFacetFreezeCurrentValuesPayload) =>
    validatePayload(
      payload,
      z.object({
        facetId: requiredNonEmptyString,
        freezeCurrentValues: z.boolean(),
      })
    )
);

export type UpdateAutoSelectionForAllCoreFacetsPayload =
  UpdateFacetAutoSelectionActionCreatorPayload;

export const updateAutoSelectionForAllCoreFacets = createAction(
  'commerce/facets/core/updateAutoSelectionForAll',
  (payload: UpdateAutoSelectionForAllCoreFacetsPayload) =>
    validatePayload(
      payload,
      z.object({
        allow: z.boolean(),
      })
    )
);
