import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions';
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
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
  deselectAllDateFacetValues,
  updateDateFacetSortCriterion,
  RegisterDateFacetActionCreatorPayload,
  updateDateFacetValues,
  toggleExcludeDateFacetValue,
} from './date-facet-actions';
import {
  getDateFacetSetInitialState,
  getDateFacetSetSliceInitialState,
} from './date-facet-set-state';
import {DateFacetRequest, DateRangeRequest} from './interfaces/request';
import {DateFacetResponse, DateFacetValue} from './interfaces/response';

export const dateFacetSetReducer = createReducer(
  getDateFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerDateFacet, (state, action) => {
        const {payload} = action;
        const request = buildDateFacetRequest(payload);
        registerRangeFacet(state, getDateFacetSetSliceInitialState(request));
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.dateFacetSet ?? state
      )
      .addCase(restoreSearchParameters, (state, action) => {
        const df = action.payload.df || {};
        handleRangeFacetSearchParameterRestoration(state, df);
      })
      .addCase(toggleSelectDateFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        toggleSelectRangeValue(state, facetId, selection);
      })
      .addCase(toggleExcludeDateFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        toggleExcludeRangeValue(state, facetId, selection);
      })
      .addCase(updateDateFacetValues, (state, action) => {
        const {facetId, values} = action.payload;
        updateRangeValues(state, facetId, values);
      })
      .addCase(deselectAllDateFacetValues, (state, action) => {
        handleRangeFacetDeselectAll(state, action.payload);
      })
      .addCase(deselectAllBreadcrumbs, (state) => {
        Object.keys(state).forEach((facetId) => {
          handleRangeFacetDeselectAll(state, facetId);
        });
      })
      .addCase(updateDateFacetSortCriterion, (state, action) => {
        handleFacetSortCriterionUpdate(state, action.payload);
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const facets = action.payload.response.facets as DateFacetResponse[];
        onRangeFacetRequestFulfilled(state, facets, convertToDateRangeRequests);
      })
      .addCase(disableFacet, (state, action) => {
        handleRangeFacetDeselectAll(state, action.payload);
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

export function convertToDateRangeRequests(
  values: DateFacetValue[]
): DateRangeRequest[] {
  return values.map((value) => {
    const {numberOfResults, ...rest} = value;
    return rest;
  });
}
