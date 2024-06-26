import {BooleanValue, NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload';
import {
  UpdateFacetIsFieldExpandedActionCreatorPayload,
  UpdateFacetNumberOfValuesActionCreatorPayload,
  UpdateFreezeCurrentValuesActionCreatorPayload,
} from '../../../facets/facet-set/facet-set-actions';
import {UpdateFacetAutoSelectionActionCreatorPayload} from '../../../facets/generic/facet-actions';

export type UpdateCoreFacetNumberOfValuesActionCreatorPayload =
  UpdateFacetNumberOfValuesActionCreatorPayload;

export const updateCoreFacetNumberOfValues = createAction(
  'commerce/facets/core/updateNumberOfValues',
  (payload: UpdateCoreFacetNumberOfValuesActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      numberOfValues: new NumberValue({required: true, min: 1}),
    })
);

export type UpdateCoreFacetIsFieldExpandedActionCreatorPayload =
  UpdateFacetIsFieldExpandedActionCreatorPayload;

export const updateCoreFacetIsFieldExpanded = createAction(
  'commerce/facets/core/updateIsFieldExpanded',
  (payload: UpdateCoreFacetIsFieldExpandedActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      isFieldExpanded: new BooleanValue({required: true}),
    })
);

export const clearAllCoreFacets = createAction('commerce/facets/core/clearAll');

export type DeselectAllValuesInCoreFacetActionCreatorPayload = {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;
};

export const deselectAllValuesInCoreFacet = createAction(
  'commerce/facets/core/deselectAllValues',
  (payload: DeselectAllValuesInCoreFacetActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
    })
);

export type UpdateCoreFacetFreezeCurrentValuesActionCreatorPayload =
  UpdateFreezeCurrentValuesActionCreatorPayload;

export const updateCoreFacetFreezeCurrentValues = createAction(
  'commerce/facets/core/updateFreezeCurrentValues',
  (payload: UpdateCoreFacetFreezeCurrentValuesActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      freezeCurrentValues: new BooleanValue({required: true}),
    })
);

export type UpdateAutoSelectionForAllCoreFacetsActionCreatorPayload =
  UpdateFacetAutoSelectionActionCreatorPayload;

export const updateAutoSelectionForAllCoreFacets = createAction(
  'commerce/facets/core/updateAutoSelectionForAll',
  (payload: UpdateAutoSelectionForAllCoreFacetsActionCreatorPayload) =>
    validatePayload(payload, {
      allow: new BooleanValue({required: true}),
    })
);
