import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import type {ToggleSelectFacetValueActionCreatorPayload} from '../../../facets/facet-set/facet-set-actions.js';
import {facetValueDefinition} from '../../../facets/facet-set/facet-set-validate-payload.js';

export type ToggleExcludeFacetValuePayload =
  ToggleSelectFacetValueActionCreatorPayload;

export const toggleExcludeFacetValue = createAction(
  'commerce/facets/regularFacet/toggleExcludeValue',
  (payload: ToggleExcludeFacetValuePayload) =>
    validatePayload(
      payload,
      z.object({
        facetId: requiredNonEmptyString,
        selection: facetValueDefinition,
      })
    )
);

export type ToggleSelectFacetValuePayload =
  ToggleSelectFacetValueActionCreatorPayload;

export const toggleSelectFacetValue = createAction(
  'commerce/facets/regularFacet/toggleSelectValue',
  (payload: ToggleSelectFacetValuePayload) =>
    validatePayload(
      payload,
      z.object({
        facetId: requiredNonEmptyString,
        selection: facetValueDefinition,
      })
    )
);
