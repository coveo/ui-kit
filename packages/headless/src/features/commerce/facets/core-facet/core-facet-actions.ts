import {BooleanValue, NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import {
  UpdateFacetIsFieldExpandedActionCreatorPayload,
  UpdateFacetNumberOfValuesActionCreatorPayload,
  UpdateFreezeCurrentValuesActionCreatorPayload,
} from '../../../facets/facet-set/facet-set-actions.js';
import {UpdateFacetAutoSelectionActionCreatorPayload} from '../../../facets/generic/facet-actions.js';

export type UpdateCoreFacetNumberOfValuesPayload =
  UpdateFacetNumberOfValuesActionCreatorPayload;

export const updateCoreFacetNumberOfValues = createAction(
  'commerce/facets/core/updateNumberOfValues',
  (payload: UpdateCoreFacetNumberOfValuesPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      numberOfValues: new NumberValue({required: true, min: 1}),
    })
);

export type UpdateCoreFacetIsFieldExpandedPayload =
  UpdateFacetIsFieldExpandedActionCreatorPayload;

export const updateCoreFacetIsFieldExpanded = createAction(
  'commerce/facets/core/updateIsFieldExpanded',
  (payload: UpdateCoreFacetIsFieldExpandedPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      isFieldExpanded: new BooleanValue({required: true}),
    })
);

export const clearAllCoreFacets = createAction('commerce/facets/core/clearAll');

export type DeselectAllValuesInCoreFacetPayload = {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;
};

export const deselectAllValuesInCoreFacet = createAction(
  'commerce/facets/core/deselectAllValues',
  (payload: DeselectAllValuesInCoreFacetPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
    })
);

export type UpdateCoreFacetFreezeCurrentValuesPayload =
  UpdateFreezeCurrentValuesActionCreatorPayload;

export const updateCoreFacetFreezeCurrentValues = createAction(
  'commerce/facets/core/updateFreezeCurrentValues',
  (payload: UpdateCoreFacetFreezeCurrentValuesPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      freezeCurrentValues: new BooleanValue({required: true}),
    })
);

export type UpdateAutoSelectionForAllCoreFacetsPayload =
  UpdateFacetAutoSelectionActionCreatorPayload;

export const updateAutoSelectionForAllCoreFacets = createAction(
  'commerce/facets/core/updateAutoSelectionForAll',
  (payload: UpdateAutoSelectionForAllCoreFacetsPayload) =>
    validatePayload(payload, {
      allow: new BooleanValue({required: true}),
    })
);
