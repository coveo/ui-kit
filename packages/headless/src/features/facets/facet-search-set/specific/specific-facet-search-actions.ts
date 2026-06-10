import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import type {SpecificFacetSearchResult} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import {
  requiredEmptyAllowedString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import {facetIdDefinition} from '../../generic/facet-actions-validation.js';
import type {FacetSearchOptions} from '../facet-search-request-options.js';
import {facetSearchOptionsDefinition} from '../generic/generic-facet-search-validate-payload.js';

const selectFacetSearchResultPayloadDefinition = z.object({
  facetId: facetIdDefinition,
  value: z.object({
    displayValue: requiredEmptyAllowedString,
    rawValue: requiredEmptyAllowedString,
    count: z.number().check(z.minimum(0)),
  }),
});

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
