import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions.js';
import {disableFacet} from '../../../facet-options/facet-options-actions.js';
import {change} from '../../../history/history-actions.js';
import {executeSearch} from '../../../search/search-actions.js';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions.js';
import {handleFacetSortCriterionUpdate} from '../../generic/facet-reducer-helpers.js';
import {
  defaultRangeFacetOptions,
  handleRangeFacetDeselectAll,
  handleRangeFacetSearchParameterRestoration,
  onRangeFacetRequestFulfilled,
  registerRangeFacet,
  toggleExcludeRangeValue,
  toggleSelectRangeValue,
  updateRangeValues,
} from '../generic/range-facet-reducers.js';
import type {
  NumericFacetRequest,
  NumericRangeRequest,
} from './interfaces/request.js';
import type {
  NumericFacetResponse,
  NumericFacetValue,
} from './interfaces/response.js';
import {
  deselectAllNumericFacetValues,
  type RegisterNumericFacetActionCreatorPayload,
  registerNumericFacet,
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateNumericFacetSortCriterion,
  updateNumericFacetValues,
} from './numeric-facet-actions.js';
import {
  getNumericFacetSetInitialState,
  getNumericFacetSetSliceInitialState,
} from './numeric-facet-set-state.js';

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
    const {numberOfResults: _numberOfResults, ...rest} = value;
    return rest;
  });
}
