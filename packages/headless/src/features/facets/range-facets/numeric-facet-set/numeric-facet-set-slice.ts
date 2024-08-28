import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions';
import {fetchProductListing} from '../../../commerce/product-listing/product-listing-actions';
import {disableFacet} from '../../../facet-options/facet-options-actions';
import {change} from '../../../history/history-actions';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions';
import {executeSearch} from '../../../search/search-actions';
import {handleFacetSortCriterionUpdate} from '../../generic/facet-reducer-helpers';
import {
  registerRangeFacet,
  toggleSelectRangeValue,
  onRangeFacetRequestFulfilled,
  handleRangeFacetDeselectAll,
  defaultRangeFacetOptions,
  handleRangeFacetSearchParameterRestoration,
  updateRangeValues,
  toggleExcludeRangeValue,
} from '../generic/range-facet-reducers';
import {NumericFacetRequest, NumericRangeRequest} from './interfaces/request';
import {NumericFacetResponse, NumericFacetValue} from './interfaces/response';
import {
  registerNumericFacet,
  toggleSelectNumericFacetValue,
  deselectAllNumericFacetValues,
  updateNumericFacetSortCriterion,
  RegisterNumericFacetActionCreatorPayload,
  updateNumericFacetValues,
  toggleExcludeNumericFacetValue,
} from './numeric-facet-actions';
import {
  getNumericFacetSetInitialState,
  getNumericFacetSetSliceInitialState,
} from './numeric-facet-set-state';

export const numericFacetSetReducer = createReducer(
  getNumericFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerNumericFacet, (state, action) => {
        const {payload} = action;
        const request = buildNumericFacetRequest(payload);
        registerRangeFacet(state, getNumericFacetSetSliceInitialState(request));
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.numericFacetSet ?? state
      )
      .addCase(restoreSearchParameters, (state, action) => {
        const nf = action.payload.nf || {};
        handleRangeFacetSearchParameterRestoration(state, nf);
      })
      .addCase(toggleSelectNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        toggleSelectRangeValue(state, facetId, selection);
      })
      .addCase(toggleExcludeNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        toggleExcludeRangeValue(state, facetId, selection);
      })
      .addCase(updateNumericFacetValues, (state, action) => {
        const {facetId, values} = action.payload;
        updateRangeValues(state, facetId, values);
      })
      .addCase(deselectAllNumericFacetValues, (state, action) => {
        handleRangeFacetDeselectAll(state, action.payload);
      })
      .addCase(deselectAllBreadcrumbs, (state) => {
        Object.keys(state).forEach((facetId) => {
          handleRangeFacetDeselectAll(state, facetId);
        });
      })
      .addCase(updateNumericFacetSortCriterion, (state, action) => {
        handleFacetSortCriterionUpdate(state, action.payload);
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const facets = action.payload.response.facets as NumericFacetResponse[];
        onRangeFacetRequestFulfilled(
          state,
          facets,
          convertToNumericRangeRequests
        );
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const facets = (action.payload.response?.facets ||
          []) as unknown as NumericFacetResponse[];
        onRangeFacetRequestFulfilled(
          state,
          facets,
          convertToNumericRangeRequests
        );
      })
      .addCase(disableFacet, (state, action) => {
        handleRangeFacetDeselectAll(state, action.payload);
      });
  }
);

function buildNumericFacetRequest(
  config: RegisterNumericFacetActionCreatorPayload
): NumericFacetRequest {
  return {
    ...defaultRangeFacetOptions,
    currentValues: [],
    preventAutoSelect: false,
    type: 'numericalRange',
    ...config,
  };
}

export function convertToNumericRangeRequests(
  values: NumericFacetValue[]
): NumericRangeRequest[] {
  return values.map((value) => {
    const {numberOfResults, ...rest} = value;
    return rest;
  });
}
