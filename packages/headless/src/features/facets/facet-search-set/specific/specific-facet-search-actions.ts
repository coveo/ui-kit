import {RecordValue, NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {SpecificFacetSearchResult} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {
  validatePayload,
  requiredEmptyAllowedString,
} from '../../../../utils/validate-payload';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {FacetSearchOptions} from '../facet-search-request-options';
import {facetSearchOptionsDefinition} from '../generic/generic-facet-search-validate-payload';

const selectFacetSearchResultPayloadDefinition = {
  facetId: facetIdDefinition,
  value: new RecordValue({
    values: {
      displayValue: requiredEmptyAllowedString,
      rawValue: requiredEmptyAllowedString,
      count: new NumberValue({required: true, min: 0}),
    },
  }),
};

type selectFacetSearchResultPayload = {
  facetId: string;
  value: SpecificFacetSearchResult;
};

export const registerFacetSearch = createAction(
  'facetSearch/register',
  (payload: FacetSearchOptions) =>
    validatePayload(payload, facetSearchOptionsDefinition)
);

export const updateFacetSearch = createAction(
  'facetSearch/update',
  (payload: FacetSearchOptions) =>
    validatePayload(payload, facetSearchOptionsDefinition)
);

export const selectFacetSearchResult = createAction(
  'facetSearch/toggleSelectValue',
  (payload: selectFacetSearchResultPayload) =>
    validatePayload(payload, selectFacetSearchResultPayloadDefinition)
);

export const excludeFacetSearchResult = createAction(
  'facetSearch/toggleExcludeValue',
  (payload: selectFacetSearchResultPayload) =>
    validatePayload(payload, selectFacetSearchResultPayloadDefinition)
);
