import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions.js';
import {disableFacet} from '../../../facet-options/facet-options-actions.js';
import {isFacetVisibleOnTab} from '../../../facet-options/facet-options-utils.js';
import {change} from '../../../history/history-actions.js';
import {executeSearch} from '../../../search/search-actions.js';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions.js';
import {updateActiveTab} from '../../../tab-set/tab-set-actions.js';
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
import {
  deselectAllDateFacetValues,
  type RegisterDateFacetActionCreatorPayload,
  registerDateFacet,
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
  updateDateFacetSortCriterion,
  updateDateFacetValues,
} from './date-facet-actions.js';
import {
  getDateFacetSetInitialState,
  getDateFacetSetSliceInitialState,
} from './date-facet-set-state.js';
import type {DateFacetRequest, DateRangeRequest} from './interfaces/request.js';
import type {DateFacetResponse, DateFacetValue} from './interfaces/response.js';

export const dateFacetSetReducer = createReducer(
  getDateFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerDateFacet, (state, action) => {
        const {payload} = action;
        const {tabs} = payload;
        const request = buildDateFacetRequest(payload);
        registerRangeFacet(
          state,
          getDateFacetSetSliceInitialState(request, tabs)
        );
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
      })
      .addCase(updateActiveTab, (state, action) => {
        const newActiveTab = action.payload;
        Object.keys(state).forEach((facetId) => {
          const facetSlice = state[facetId]!;
          const hasTabs =
            facetSlice.tabs?.included?.length ||
            facetSlice.tabs?.excluded?.length;
          if (hasTabs && !isFacetVisibleOnTab(facetSlice.tabs, newActiveTab)) {
            handleRangeFacetDeselectAll(state, facetId);
          }
        });
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
    const {numberOfResults: _numberOfResults, ...rest} = value;
    return rest;
  });
}
