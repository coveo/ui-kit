import {DateFacetRequest, DateRangeRequest} from './interfaces/request';
import {createReducer} from '@reduxjs/toolkit';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
  deselectAllDateFacetValues,
  updateDateFacetSortCriterion,
} from './date-facet-actions';
import {change} from '../../../history/history-actions';
import {executeSearch} from '../../../search/search-actions';
import {DateFacetResponse, DateFacetValue} from './interfaces/response';
import {DateFacetRegistrationOptions} from './interfaces/options';
import {
  registerRangeFacet,
  toggleSelectRangeValue,
  onRangeFacetRequestFulfilled,
  handleRangeFacetDeselectAll,
} from '../generic/range-facet-reducers';
import {handleFacetSortCriterionUpdate} from '../../generic/facet-reducer-helpers';

export type DateFacetSetState = Record<string, DateFacetRequest>;

export function getDateFacetSetInitialState(): DateFacetSetState {
  return {};
}

export const dateFacetSetReducer = createReducer(
  getDateFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerDateFacet, (state, action) => {
        const {payload} = action;
        const request = buildDateFacetRequest(payload);
        registerRangeFacet<DateFacetRequest>(state, request);
      })
      .addCase(change.fulfilled, (_, action) => action.payload.dateFacetSet)
      .addCase(toggleSelectDateFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        toggleSelectRangeValue<DateFacetRequest, DateFacetValue>(
          state,
          facetId,
          selection
        );
      })
      .addCase(deselectAllDateFacetValues, (state, action) => {
        handleRangeFacetDeselectAll<DateFacetRequest>(state, action.payload);
      })
      .addCase(updateDateFacetSortCriterion, (state, action) => {
        handleFacetSortCriterionUpdate<DateFacetRequest>(state, action.payload);
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const facets = action.payload.response.facets as DateFacetResponse[];
        onRangeFacetRequestFulfilled<DateFacetRequest, DateFacetResponse>(
          state,
          facets,
          convertToRangeRequests
        );
      });
  }
);

function buildDateFacetRequest(
  config: DateFacetRegistrationOptions
): DateFacetRequest {
  return {
    currentValues: [],
    preventAutoSelect: false,
    filterFacetCount: false,
    injectionDepth: 1000,
    numberOfValues: 8, // TODO: check value when manual vs. automatic
    sortCriteria: 'ascending',
    type: 'dateRange',
    ...config,
  };
}

function convertToRangeRequests(values: DateFacetValue[]): DateRangeRequest[] {
  return values.map((value) => {
    const {numberOfResults, ...rest} = value;
    return rest;
  });
}
