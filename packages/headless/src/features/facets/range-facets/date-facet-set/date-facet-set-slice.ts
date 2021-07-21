import {DateFacetRequest, DateRangeApiRequest} from './interfaces/request';
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
import {formatDate} from '../../../relative-date-set/relative-date';
import {DateRangeRequest} from '../../../../controllers';
import {restoreSearchParameters} from '../../../search-parameters/search-parameter-actions';

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
          mapCurrentValues(values)
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

function buildDateFacetRequest(
  config: RegisterDateFacetActionCreatorPayload
): DateFacetRequest {
  return {
    ...defaultRangeFacetOptions,
    preventAutoSelect: false,
    type: 'dateRange',
    ...config,
    currentValues: config.currentValues
      ? mapCurrentValues(config.currentValues)
      : [],
  };
}

function mapCurrentValues(
  currentValues: DateRangeRequest[]
): DateRangeApiRequest[] {
  return currentValues.map((value) => ({
    ...value,
    start: formatDate(value.start),
    end: formatDate(value.end),
  }));
}

function convertToRangeRequests(
  values: DateFacetApiValue[]
): DateRangeApiRequest[] {
  return values.map((value) => {
    const {numberOfResults, ...rest} = value;
    return rest;
  });
}
