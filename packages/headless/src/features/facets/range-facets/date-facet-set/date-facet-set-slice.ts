import {DateFacetRequest, DateRangeRequest} from './interfaces/request';
import {createReducer} from '@reduxjs/toolkit';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
  deselectAllDateFacetValues,
  updateDateFacetSortCriterion,
  RegisterDateFacetActionCreatorPayload,
  updateDateFacetValues,
} from './date-facet-actions';
import {change} from '../../../history/history-actions';
import {executeSearch} from '../../../search/search-actions';
import {DateFacetResponse, DateFacetValue} from './interfaces/response';
import {
  registerRangeFacet,
  toggleSelectRangeValue,
  onRangeFacetRequestFulfilled,
  handleRangeFacetDeselectAll,
  defaultRangeFacetOptions,
  updateRangeValues,
  handleRangeFacetSearchParameterRestoration,
} from '../generic/range-facet-reducers';
import {handleFacetSortCriterionUpdate} from '../../generic/facet-reducer-helpers';
import {getDateFacetSetInitialState} from './date-facet-set-state';
import {deselectAllFacets} from '../../generic/facet-actions';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions';
import {assignRelativeDates} from './date-facet-selectors';

export const dateFacetSetReducer = createReducer(
  getDateFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerDateFacet, (state, action) => {
        const {payload} = action;
        const request = buildDateFacetRequest(payload);
        registerRangeFacet<DateFacetRequest>(state, request);
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.dateFacetSet ?? state
      )
      .addCase(restoreSearchParameters, (state, action) => {
        const df = action.payload.df || {};
        const facetIds = Object.keys(state);

        facetIds.forEach((id) => {
          const request = state[id];
          const paramsValues = df[id] || [];

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
      .addCase(toggleSelectDateFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        toggleSelectRangeValue<DateFacetRequest, DateFacetValue>(
          state,
          facetId,
          selection,
          findRange
        );
      })
      .addCase(updateDateFacetValues, (state, action) => {
        const {facetId, values} = action.payload;
        updateRangeValues<DateFacetRequest>(state, facetId, values);
      })
      .addCase(deselectAllDateFacetValues, (state, action) => {
        handleRangeFacetDeselectAll<DateFacetRequest>(state, action.payload);
      })
      .addCase(deselectAllFacets, (state) => {
        Object.keys(state).forEach((facetId) => {
          handleRangeFacetDeselectAll<DateFacetRequest>(state, facetId);
        });
      })
      .addCase(updateDateFacetSortCriterion, (state, action) => {
        handleFacetSortCriterionUpdate<DateFacetRequest>(state, action.payload);
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const facets = action.payload.response.facets as DateFacetResponse[];
        onRangeFacetRequestFulfilled<DateFacetRequest, DateFacetResponse>(
          state,
          facets,
          convertToRangeRequests,
          assignRelativeDates
        );
      });
  }
);

function buildDateFacetRequest(
  config: RegisterDateFacetActionCreatorPayload
): DateFacetRequest {
  return {
    ...defaultRangeFacetOptions,
    currentValues: [],
    preventAutoSelect: false,
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

function findRange(values: DateRangeRequest[], value: DateRangeRequest) {
  const {start, end, relativeDate} = value;
  if (relativeDate) {
    return values.find(
      (range) =>
        range.relativeDate &&
        range.relativeDate.period === relativeDate.period &&
        range.relativeDate.unit === relativeDate.unit &&
        range.relativeDate.amount === relativeDate.amount
    );
  }
  return values.find((range) => range.start === start && range.end === end);
}
