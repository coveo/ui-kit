import {
  DateFacetRequest,
  DateRangeApiRequest,
  DateRangeMappedRequest,
} from './interfaces/request';
import {createReducer} from '@reduxjs/toolkit';
import {
  registerDateFacet,
  toggleSelectDateFacetValue,
  deselectAllDateFacetValues,
  updateDateFacetSortCriterion,
  updateDateFacetValues,
} from './date-facet-actions';
import {change} from '../../../history/history-actions';
import {executeSearch} from '../../../search/search-actions';
import {DateFacetResponse, DateFacetApiValue} from './interfaces/response';
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

function extractRelativeDateValues(
  ranges: DateRangeMappedRequest[]
): DateRangeApiRequest[] {
  return ranges.map((range) => ({
    ...range,
    start: typeof range.start === 'string' ? range.start : range.start.value,
    end: typeof range.end === 'string' ? range.end : range.end.value,
  }));
}

export const dateFacetSetReducer = createReducer(
  getDateFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerDateFacet, (state, action) => {
        const {payload} = action;
        const request: DateFacetRequest = {
          ...defaultRangeFacetOptions,
          preventAutoSelect: false,
          type: 'dateRange',
          ...payload,
          currentValues: extractRelativeDateValues(payload.currentValues),
        };
        registerRangeFacet<DateFacetRequest>(state, request);
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.dateFacetSet ?? state
      )
      .addCase(restoreSearchParameters, (state, action) => {
        const df = action.payload.df || {};
        const facets: Record<string, DateRangeApiRequest[]> = {};
        Object.entries(df).forEach(([facetId, ranges]) => {
          facets[facetId] = ranges.map((value) => {
            return {
              ...value,
              start:
                typeof value.start === 'string'
                  ? value.start
                  : value.start.value,
              end: typeof value.end === 'string' ? value.end : value.end.value,
            };
          });
        });
        handleRangeFacetSearchParameterRestoration(state, facets);
      })
      .addCase(toggleSelectDateFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        toggleSelectRangeValue<DateFacetRequest, DateFacetApiValue>(
          state,
          facetId,
          selection
        );
      })
      .addCase(updateDateFacetValues, (state, action) => {
        const {facetId, values} = action.payload;
        updateRangeValues<DateFacetRequest>(
          state,
          facetId,
          extractRelativeDateValues(values)
        );
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
          convertToRangeRequests
        );
      });
  }
);

function convertToRangeRequests(
  values: DateFacetApiValue[]
): DateRangeApiRequest[] {
  return values.map((value) => {
    const {numberOfResults, ...rest} = value;
    return rest;
  });
}
