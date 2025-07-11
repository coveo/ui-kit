import {createReducer, type Draft as WritableDraft} from '@reduxjs/toolkit';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../../breadcrumb/breadcrumb-actions.js';
import {disableFacet} from '../../facet-options/facet-options-actions.js';
import {change} from '../../history/history-actions.js';
import {executeSearch, fetchFacetValues} from '../../search/search-actions.js';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions.js';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../facet-search-set/specific/specific-facet-search-actions.js';
import {updateFacetAutoSelection} from '../generic/facet-actions.js';
import {
  handleFacetDeselectAll,
  handleFacetSortCriterionUpdate,
  handleFacetUpdateNumberOfValues,
} from '../generic/facet-reducer-helpers.js';
import type {AnyFacetResponse} from '../generic/interfaces/generic-facet-response.js';
import {
  deselectAllFacetValues,
  type RegisterFacetActionCreatorPayload,
  registerFacet,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
  updateFacetSortCriterion,
  updateFreezeCurrentValues,
} from './facet-set-actions.js';
import {
  getFacetSetInitialState,
  getFacetSetSliceInitialState,
} from './facet-set-state.js';
import type {FacetOptionalParameters} from './interfaces/options.js';
import type {FacetRequest, FacetValueRequest} from './interfaces/request.js';
import type {FacetResponse, FacetValue} from './interfaces/response.js';

export const facetSetReducer = createReducer(
  getFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerFacet, (state, action) => {
        const {facetId} = action.payload;

        if (facetId in state) {
          return;
        }

        state[facetId] = getFacetSetSliceInitialState(
          buildFacetRequest(action.payload)
        );
      })
      .addCase(change.fulfilled, (_, action) => {
        if (!action.payload) {
          return;
        }

        if (Object.keys(action.payload.facetSet).length === 0) {
          return;
        }

        return action.payload.facetSet;
      })
      .addCase(restoreSearchParameters, (state, action) => {
        const f = action.payload.f || {};
        const fExcluded = action.payload.fExcluded || {};
        const facetIds = Object.keys(state);

        facetIds.forEach((id) => {
          const {request} = state[id]!;
          const selectedValues = f[id] || [];
          const excludedValues = fExcluded[id] || [];
          const activeValueCount =
            selectedValues.length + excludedValues.length;
          const idleValues = request.currentValues.filter(
            (facetValue) =>
              !selectedValues.includes(facetValue.value) &&
              !excludedValues.includes(facetValue.value)
          );

          request.currentValues = [
            ...selectedValues.map(buildSelectedFacetValueRequest),
            ...excludedValues.map(buildExcludedFacetValueRequest),
            ...idleValues.map(restoreFacetValueToIdleState),
          ];
          request.preventAutoSelect = activeValueCount > 0;
          request.numberOfValues = Math.max(
            activeValueCount,
            request.numberOfValues
          );
        });
      })
      .addCase(toggleSelectFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = facetRequest.currentValues.find(
          (req) => req.value === selection.value
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        const isSelected = existingValue.state === 'selected';
        existingValue.previousState = existingValue.state;
        existingValue.state = isSelected ? 'idle' : 'selected';
        facetRequest.freezeCurrentValues = true;
      })
      .addCase(toggleExcludeFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = facetRequest.currentValues.find(
          (req) => req.value === selection.value
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        const isExcluded = existingValue.state === 'excluded';
        existingValue.previousState = existingValue.state;
        existingValue.state = isExcluded ? 'idle' : 'excluded';
        facetRequest.freezeCurrentValues = true;
      })
      .addCase(updateFreezeCurrentValues, (state, action) => {
        const {facetId, freezeCurrentValues} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        facetRequest.freezeCurrentValues = freezeCurrentValues;
      })
      .addCase(deselectAllFacetValues, (state, action) => {
        handleFacetDeselectAll(state[action.payload]?.request);
      })
      .addCase(deselectAllBreadcrumbs, (state) => {
        Object.values(state)
          .filter((slice) => slice.hasBreadcrumbs)
          .forEach(({request}) => handleFacetDeselectAll(request));
      })
      .addCase(deselectAllNonBreadcrumbs, (state) => {
        Object.values(state)
          .filter((slice) => !slice.hasBreadcrumbs)
          .forEach(({request}) => handleFacetDeselectAll(request));
      })
      .addCase(updateFacetAutoSelection, (state, action) =>
        Object.values(state).forEach((slice) => {
          slice.request.preventAutoSelect = !action.payload.allow;
        })
      )
      .addCase(updateFacetSortCriterion, (state, action) => {
        handleFacetSortCriterionUpdate(state, action.payload);
      })
      .addCase(updateFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;
        handleFacetUpdateNumberOfValues<FacetRequest>(
          state[facetId]?.request,
          numberOfValues
        );
      })
      .addCase(updateFacetIsFieldExpanded, (state, action) => {
        const {facetId, isFieldExpanded} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        facetRequest.isFieldExpanded = isFieldExpanded;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const facets = action.payload.response.facets;
        facets.forEach((facetResponse) =>
          mutateStateFromFacetResponse(
            state[facetResponse.facetId]?.request,
            facetResponse
          )
        );
      })
      .addCase(fetchFacetValues.fulfilled, (state, action) => {
        const facets = action.payload.response.facets;
        facets.forEach((facetResponse) =>
          mutateStateFromFacetResponse(
            state[facetResponse.facetId]?.request,
            facetResponse
          )
        );
      })
      .addCase(selectFacetSearchResult, (state, action) => {
        const {facetId, value} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        const {rawValue} = value;
        const {currentValues} = facetRequest;
        const matchingValue = currentValues.find((v) => v.value === rawValue);

        if (matchingValue) {
          matchingValue.state = 'selected';
          return;
        }

        const searchResultValue = buildSelectedFacetValueRequest(rawValue);
        insertNewValue(facetRequest, searchResultValue);
        facetRequest.freezeCurrentValues = true;
        facetRequest.preventAutoSelect = true;
      })
      .addCase(excludeFacetSearchResult, (state, action) => {
        const {facetId, value} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        const {rawValue} = value;
        const {currentValues} = facetRequest;
        const matchingValue = currentValues.find((v) => v.value === rawValue);

        if (matchingValue) {
          matchingValue.state = 'excluded';
          return;
        }

        const searchResultValue = buildExcludedFacetValueRequest(rawValue);
        insertNewValue(facetRequest, searchResultValue);
        facetRequest.freezeCurrentValues = true;
        facetRequest.preventAutoSelect = true;
      })
      .addCase(disableFacet, (state, action) => {
        if (!(action.payload in state)) {
          return;
        }
        const {request} = state[action.payload]!;
        handleFacetDeselectAll(request);
      });
  }
);

function insertNewValue(
  facetRequest: FacetRequest,
  facetValue: FacetValueRequest
) {
  const {currentValues} = facetRequest;
  const firstIdleIndex = currentValues.findIndex((v) => v.state === 'idle');
  const indexToInsertAt =
    firstIdleIndex === -1 ? currentValues.length : firstIdleIndex;

  facetRequest.currentValues.splice(indexToInsertAt, 0, facetValue);

  if (firstIdleIndex > -1) {
    facetRequest.currentValues.pop();
  }

  facetRequest.numberOfValues = facetRequest.currentValues.length;
}

function mutateStateFromFacetResponse(
  facetRequest: WritableDraft<FacetRequest> | undefined,
  facetResponse: AnyFacetResponse
) {
  if (!facetRequest) {
    return;
  }

  facetRequest.currentValues = (facetResponse as FacetResponse).values.map(
    convertFacetValueToRequest
  );
  facetRequest.freezeCurrentValues = false;
  facetRequest.preventAutoSelect = false;
}

export const defaultFacetOptions: FacetOptionalParameters = {
  filterFacetCount: true,
  injectionDepth: 1000,
  numberOfValues: 8,
  sortCriteria: 'automatic',
  resultsMustMatch: 'atLeastOneValue',
};

function buildFacetRequest(
  config: RegisterFacetActionCreatorPayload
): FacetRequest {
  return {
    ...defaultFacetOptions,
    type: 'specific',
    currentValues: [],
    freezeCurrentValues: false,
    isFieldExpanded: false,
    preventAutoSelect: false,
    ...config,
  };
}

export function convertFacetValueToRequest(
  facetValue: FacetValue
): FacetValueRequest {
  const {value, state} = facetValue;

  return {value, state};
}

function buildSelectedFacetValueRequest(value: string): FacetValueRequest {
  return {value, state: 'selected'};
}

function buildExcludedFacetValueRequest(value: string): FacetValueRequest {
  return {value, state: 'excluded'};
}

function restoreFacetValueToIdleState(
  facetValue: FacetValueRequest
): FacetValueRequest {
  return {...facetValue, state: 'idle'};
}
