import {createAction} from '@reduxjs/toolkit';
import {FacetSearchOptions} from '../facet-search-request-options';
import {CategoryFacetSearchResult} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {validateActionPayload} from '../../../../utils/validate-payload';
import {
  facetIdDefinition,
  requiredNonEmptyString,
} from '../../generic/facet-actions-validation';
import {NumberValue, RecordValue, ArrayValue, StringValue} from '@coveo/bueno';
import {facetSearchOptionsDefinition} from '../generic/generic-facet-search-validate-payload';

const categoryFacetSearchResultDefinition = {
  path: new ArrayValue({
    required: true,
    each: new StringValue({required: true, emptyAllowed: false}),
  }),
  displayValue: requiredNonEmptyString,
  rawValue: requiredNonEmptyString,
  count: new NumberValue({required: true, min: 0}),
};

/** Selects the corresponding category facet value for the provided
 * category facet search result */
export const selectCategoryFacetSearchResult = createAction(
  'categoryFacet/selectSearchResult',
  (payload: {facetId: string; value: CategoryFacetSearchResult}) =>
    validateActionPayload(payload, {
      facetId: facetIdDefinition,
      value: new RecordValue({values: categoryFacetSearchResultDefinition}),
    })
);

/**
 * Registers a category facet search box with the specified options.
 * @param (FacetSearchOptions) An object specifying the target facet and facet search box options.
 */
export const registerCategoryFacetSearch = createAction(
  'categoryFacetSearch/register',
  (payload: FacetSearchOptions) =>
    validateActionPayload(payload, facetSearchOptionsDefinition)
);
