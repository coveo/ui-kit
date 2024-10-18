import {RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import {ToggleSelectFacetValueActionCreatorPayload} from '../../../facets/facet-set/facet-set-actions.js';
import {facetValueDefinition} from '../../../facets/facet-set/facet-set-validate-payload.js';

export type ToggleExcludeFacetValuePayload =
  ToggleSelectFacetValueActionCreatorPayload;

export const toggleExcludeLocationFacetValue = createAction(
  'commerce/facets/locationFacet/toggleExcludeValue',
  (payload: ToggleExcludeFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);

export type ToggleSelectFacetValuePayload =
  ToggleSelectFacetValueActionCreatorPayload;

export const toggleSelectLocationFacetValue = createAction(
  'commerce/facets/locationFacet/toggleSelectValue',
  (payload: ToggleSelectFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);
