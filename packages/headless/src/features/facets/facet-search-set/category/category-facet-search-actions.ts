import {ArrayValue, NumberValue, RecordValue} from '@coveo/bueno';
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

const categoryFacetSearchResultDefinition = {
  path: new ArrayValue({
    required: true,
    each: requiredNonEmptyString,
  }),
  displayValue: requiredEmptyAllowedString,
  rawValue: requiredEmptyAllowedString,
  count: new NumberValue({required: true, min: 0}),
};

export const selectCategoryFacetSearchResult = createAction(
  'categoryFacet/selectSearchResult',
  (payload: {facetId: string; value: CategoryFacetSearchResult}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      value: new RecordValue({values: categoryFacetSearchResultDefinition}),
    })
);

export const registerCategoryFacetSearch = createAction(
  'categoryFacetSearch/register',
  (payload: FacetSearchOptions) =>
    validatePayload(payload, facetSearchOptionsDefinition)
);
