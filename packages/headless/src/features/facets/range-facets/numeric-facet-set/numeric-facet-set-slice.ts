import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions';
import {disableFacet} from '../../../facet-options/facet-options-actions';
import {change} from '../../../history/history-actions';
import {fetchProductListing} from '../../../product-listing/product-listing-actions';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions';
import {executeSearch} from '../../../search/search-actions';
import {deselectAllFacets} from '../../generic/facet-actions';
import {handleFacetSortCriterionUpdate} from '../../generic/facet-reducer-helpers';
import {
  registerRangeFacet,
  toggleSelectRangeValue,
  onRangeFacetRequestFulfilled,
  handleRangeFacetDeselectAll,
  defaultRangeFacetOptions,
  handleRangeFacetSearchParameterRestoration,
  updateRangeValues,
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
} from './numeric-facet-actions';
import {getNumericFacetSetInitialState} from './numeric-facet-set-state';

export const numericFacetSetReducer = createReducer(
  getNumericFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerNumericFacet, (state, action) => {
        const {payload} = action;
        const request = buildNumericFacetRequest(payload);
        registerRangeFacet<NumericFacetRequest>(state, request);
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
        toggleSelectRangeValue<NumericFacetRequest, NumericFacetValue>(
          state,
          facetId,
          selection
        );
      })
      .addCase(updateNumericFacetValues, (state, action) => {
        const {facetId, values} = action.payload;
        updateRangeValues<NumericFacetRequest>(state, facetId, values);
      })
      .addCase(deselectAllNumericFacetValues, (state, action) => {
        handleRangeFacetDeselectAll<NumericFacetRequest>(state, action.payload);
      })
      .addCase(deselectAllFacets, (state) => {
        Object.keys(state).forEach((facetId) => {
          handleRangeFacetDeselectAll(state, facetId);
        });
      })
      .addCase(deselectAllBreadcrumbs, (state) => {
        Object.keys(state).forEach((facetId) => {
          handleRangeFacetDeselectAll(state, facetId);
        });
      })
      .addCase(updateNumericFacetSortCriterion, (state, action) => {
        handleFacetSortCriterionUpdate<NumericFacetRequest>(
          state,
          action.payload
        );
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const facets = action.payload.response.facets as NumericFacetResponse[];
        onRangeFacetRequestFulfilled<NumericFacetRequest, NumericFacetResponse>(
          state,
          facets,
          convertToRangeRequests
        );
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const facets = (action.payload.response?.facets?.results ||
          []) as NumericFacetResponse[];
        onRangeFacetRequestFulfilled<NumericFacetRequest, NumericFacetResponse>(
          state,
          facets,
          convertToRangeRequests
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

function convertToRangeRequests(
  values: NumericFacetValue[]
): NumericRangeRequest[] {
  return values.map((value) => {
    const {numberOfResults, ...rest} = value;
    return rest;
  });
}
