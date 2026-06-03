import {BooleanValue, NumberValue} from '@coveo/bueno';
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

/**
 * Action to clear all core facet values.
 *
 * This is primarily used by the breadcrumb manager to reset all selected facets.
 */
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

/**
 * Action to deselect all values for a given facet.
 *
 * This is primarily used in facets to clear all selected values at the same time.
 *
 * @param payload - The payload of type {@link DeselectAllValuesInCoreFacetPayload} containing the facet ID to clear.
 */
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
