import {NumericFacetRequest, NumericRangeRequest} from './interfaces/request';
import {createReducer} from '@reduxjs/toolkit';
import {
  registerNumericFacet,
  toggleSelectNumericFacetValue,
  deselectAllNumericFacetValues,
  updateNumericFacetSortCriterion,
} from './numeric-facet-actions';
import {change} from '../../../history/history-actions';
import {executeSearch} from '../../../search/search-actions';
import {NumericFacetResponse, NumericFacetValue} from './interfaces/response';
import {NumericFacetRegistrationOptions} from './interfaces/options';
import {
  registerRangeFacet,
  toggleSelectRangeValue,
  onRangeFacetRequestFulfilled,
  handleRangeFacetDeselectAll,
  defaultRangeFacetOptions,
} from '../generic/range-facet-reducers';
import {handleFacetSortCriterionUpdate} from '../../generic/facet-reducer-helpers';
import {getNumericFacetSetInitialState} from './numeric-facet-set-state';
import {deselectAllFacets} from '../../generic/facet-actions';

export const numericFacetSetReducer = createReducer(
  getNumericFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerNumericFacet, (state, action) => {
        const {payload} = action;
        const request = buildNumericFacetRequest(payload);
        registerRangeFacet<NumericFacetRequest>(state, request);
      })
      .addCase(change.fulfilled, (_, action) => action.payload.numericFacetSet)
      .addCase(toggleSelectNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        toggleSelectRangeValue<NumericFacetRequest, NumericFacetValue>(
          state,
          facetId,
          selection
        );
      })
      .addCase(deselectAllNumericFacetValues, (state, action) => {
        handleRangeFacetDeselectAll<NumericFacetRequest>(state, action.payload);
      })
      .addCase(deselectAllFacets, (state) => {
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
      });
  }
);

function buildNumericFacetRequest(
  config: NumericFacetRegistrationOptions
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
