import {RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import {facetValueDefinition} from '../../../facets/facet-set/facet-set-validate-payload.js';
import {
  ToggleExcludeFacetValuePayload,
  ToggleSelectFacetValuePayload,
} from '../regular-facet/regular-facet-actions.js';

export const toggleExcludeLocationFacetValue = createAction(
  'commerce/facets/locationFacet/toggleExcludeValue',
  (payload: ToggleExcludeFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);

export const toggleSelectLocationFacetValue = createAction(
  'commerce/facets/locationFacet/toggleSelectValue',
  (payload: ToggleSelectFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);
