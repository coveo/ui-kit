import {createAction} from '@reduxjs/toolkit';
import {SpecificFacetSearchResult} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {FacetSearchOptions} from '../facet-search-request-options';
import {RecordValue, NumberValue} from '@coveo/bueno';
import {
  facetIdDefinition,
  requiredNonEmptyString,
} from '../../generic/facet-actions-validation';
import {validateActionPayload} from '../../../../utils/validate-payload';
import {facetSearchOptionsDefinition} from '../generic/generic-facet-search-validate-payload';

const selectFacetSearchResultPayloadDefinition = {
  facetId: facetIdDefinition,
  value: new RecordValue({
    values: {
      displayValue: requiredNonEmptyString,
      rawValue: requiredNonEmptyString,
      count: new NumberValue({required: true, min: 0}),
    },
  }),
};

type selectFacetSearchResultPayload = {
  facetId: string;
  value: SpecificFacetSearchResult;
};

/**
 * Registers a facet search box with the specified options.
 * @param (FacetSearchOptions) An object specifying the target facet and facet search box options.
 */
export const registerFacetSearch = createAction(
  'facetSearch/register',
  (payload: FacetSearchOptions) =>
    validateActionPayload(payload, facetSearchOptionsDefinition)
);

/**
 * Updates the options of a facet search box.
 * @param (FacetSearchOptions) An object specifying the target facet and facet search box options.
 */
export const updateFacetSearch = createAction(
  'facetSearch/update',
  (payload: FacetSearchOptions) =>
    validateActionPayload(payload, facetSearchOptionsDefinition)
);

/**
 * Selects a facet search result.
 * @param (selectFacetSearchResultPayload) An object that specifies the target facet and facet search result.
 */
export const selectFacetSearchResult = createAction(
  'facetSearch/toggleSelectValue',
  (payload: selectFacetSearchResultPayload) =>
    validateActionPayload(payload, selectFacetSearchResultPayloadDefinition)
);
