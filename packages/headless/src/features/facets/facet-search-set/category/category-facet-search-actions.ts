import * as z from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import type {CategoryFacetSearchResult} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import {facetIdDefinition} from '../../generic/facet-actions-validation.js';
import type {FacetSearchOptions} from '../facet-search-request-options.js';
import {facetSearchOptionsDefinition} from '../generic/generic-facet-search-validate-payload.js';

const categoryFacetSearchResultDefinition = z.object({
  path: z.array(requiredNonEmptyString),
  displayValue: requiredEmptyAllowedString,
  rawValue: requiredEmptyAllowedString,
  count: z.number().check(z.minimum(0)),
});

export const selectCategoryFacetSearchResult = createAction(
  'categoryFacet/selectSearchResult',
  (payload: {facetId: string; value: CategoryFacetSearchResult}) =>
    validatePayload(
      payload,
      z.object({
        facetId: facetIdDefinition,
        value: categoryFacetSearchResultDefinition,
      })
    )
);

export const registerCategoryFacetSearch = createAction(
  'categoryFacetSearch/register',
  (payload: FacetSearchOptions) =>
    validatePayload(payload, facetSearchOptionsDefinition)
);
