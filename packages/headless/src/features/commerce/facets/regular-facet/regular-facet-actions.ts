import {RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload';
import {ToggleSelectFacetValueActionCreatorPayload} from '../../../facets/facet-set/facet-set-actions';
import {facetValueDefinition} from '../../../facets/facet-set/facet-set-validate-payload';

export type ToggleExcludeFacetValueActionCreatorPayload =
  ToggleSelectFacetValueActionCreatorPayload;

export const toggleExcludeFacetValue = createAction(
  'commerce/facets/regularFacet/toggleExcludeValue',
  (payload: ToggleExcludeFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);

export const toggleSelectFacetValue = createAction(
  'commerce/facets/regularFacet/toggleSelectValue',
  (payload: ToggleSelectFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);
