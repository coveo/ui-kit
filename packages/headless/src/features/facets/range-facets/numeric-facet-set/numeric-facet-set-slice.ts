import {NumericFacetRequest, NumericRangeRequest} from './interfaces/request';
import {createReducer} from '@reduxjs/toolkit';
import {
  registerNumericFacet,
  toggleSelectNumericFacetValue,
  deselectAllNumericFacetValues,
  updateNumericFacetSortCriterion,
  RegisterNumericFacetActionCreatorPayload,
  updateNumericFacetValues,
} from './numeric-facet-actions';
import {change} from '../../../history/history-actions';
import {executeSearch} from '../../../search/search-actions';
import {NumericFacetResponse, NumericFacetValue} from './interfaces/response';
import {
  registerRangeFacet,
  toggleSelectRangeValue,
  onRangeFacetRequestFulfilled,
  handleRangeFacetDeselectAll,
  defaultRangeFacetOptions,
  handleRangeFacetSearchParameterRestoration,
  updateRangeValues,
} from '../generic/range-facet-reducers';
import {handleFacetSortCriterionUpdate} from '../../generic/facet-reducer-helpers';
import {getNumericFacetSetInitialState} from './numeric-facet-set-state';
import {deselectAllFacets} from '../../generic/facet-actions';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions';

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
        const facetIds = Object.keys(state);

        facetIds.forEach((id) => {
          const request = state[id];
          const paramsValues = nf[id] || [];

          request.currentValues = handleRangeFacetSearchParameterRestoration(
            request.currentValues,
            paramsValues,
            findRange
          );
          request.numberOfValues = Math.max(
            request.currentValues.length,
            request.numberOfValues
          );
        });
      })
      .addCase(toggleSelectNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        toggleSelectRangeValue<NumericFacetRequest, NumericFacetValue>(
          state,
          facetId,
          selection,
          findRange
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

function findRange(values: NumericRangeRequest[], value: NumericRangeRequest) {
  const {start, end} = value;
  return values.find((range) => range.start === start && range.end === end);
}
