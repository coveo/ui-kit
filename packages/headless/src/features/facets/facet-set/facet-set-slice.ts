import {createReducer} from '@reduxjs/toolkit';
import {change} from '../../history/history-actions';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
  updateFacetIsFieldExpanded,
  updateFreezeCurrentValues,
  RegisterFacetActionCreatorPayload,
} from './facet-set-actions';
import {executeSearch, fetchFacetValues} from '../../search/search-actions';
import {selectFacetSearchResult} from '../facet-search-set/specific/specific-facet-search-actions';
import {FacetRequest, FacetValueRequest} from './interfaces/request';
import {FacetValue, FacetResponse} from './interfaces/response';
import {FacetOptionalParameters} from './interfaces/options';
import {
  handleFacetSortCriterionUpdate,
  handleFacetDeselectAll,
  handleFacetUpdateNumberOfValues,
} from '../generic/facet-reducer-helpers';
import {getFacetSetInitialState} from './facet-set-state';
import {
  deselectAllFacets,
  updateFacetAutoSelection,
} from '../generic/facet-actions';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';
import {fetchProductListing} from '../../product-listing/product-listing-actions';
import {WritableDraft} from 'immer/dist/internal';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';
import {deselectAllBreadcrumbs} from '../../breadcrumb/breadcrumb-actions';

export const facetSetReducer = createReducer(
  getFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerFacet, (state, action) => {
        const {facetId} = action.payload;

        if (facetId in state) {
          return;
        }

        state[facetId] = buildFacetRequest(action.payload);
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
        const facetIds = Object.keys(state);

        facetIds.forEach((id) => {
          const request = state[id];
          const values = f[id] || [];

          request.currentValues = values.map(buildSelectedFacetValueRequest);
          request.preventAutoSelect = values.length > 0;
          request.numberOfValues = Math.max(
            values.length,
            request.numberOfValues
          );
        });
      })
      .addCase(toggleSelectFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId];

        if (!facetRequest) {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = facetRequest.currentValues.find(
          (req) => req.value === selection.value
        );
        if (!existingValue) {
          insertValueBeforeIdleValues(facetRequest, selection);
          return;
        }

        const isSelected = existingValue.state === 'selected';
        existingValue.state = isSelected ? 'idle' : 'selected';
        facetRequest.freezeCurrentValues = true;
      })
      .addCase(updateFreezeCurrentValues, (state, action) => {
        const {facetId, freezeCurrentValues} = action.payload;
        const facetRequest = state[facetId];

        if (!facetRequest) {
          return;
        }

        facetRequest.freezeCurrentValues = freezeCurrentValues;
      })
      .addCase(deselectAllFacetValues, (state, action) => {
        const request = state[action.payload];
        handleFacetDeselectAll(request);
      })
      .addCase(deselectAllFacets, (state) => {
        Object.keys(state).forEach((facetId) => {
          const request = state[facetId];
          handleFacetDeselectAll(request);
        });
      })
      .addCase(deselectAllBreadcrumbs, (state) => {
        Object.keys(state).forEach((facetId) => {
          const request = state[facetId];
          handleFacetDeselectAll(request);
        });
      })
      .addCase(updateFacetAutoSelection, (state, action) =>
        Object.keys(state).forEach((facetId) => {
          state[facetId].preventAutoSelect = !action.payload.allow;
        })
      )
      .addCase(updateFacetSortCriterion, (state, action) => {
        handleFacetSortCriterionUpdate<FacetRequest>(state, action.payload);
      })
      .addCase(updateFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;
        handleFacetUpdateNumberOfValues<FacetRequest>(
          state[facetId],
          numberOfValues
        );
      })
      .addCase(updateFacetIsFieldExpanded, (state, action) => {
        const {facetId, isFieldExpanded} = action.payload;
        const facetRequest = state[facetId];

        if (!facetRequest) {
          return;
        }

        facetRequest.isFieldExpanded = isFieldExpanded;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const facets = action.payload.response.facets;
        facets.forEach((facetResponse) =>
          mutateStateFromFacetResponse(
            state[facetResponse.facetId],
            facetResponse
          )
        );
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const facets = action.payload.response?.facets?.results || [];
        facets.forEach((facetResponse) =>
          mutateStateFromFacetResponse(
            state[facetResponse.facetId],
            facetResponse
          )
        );
      })
      .addCase(fetchFacetValues.fulfilled, (state, action) => {
        const facets = action.payload.response.facets;
        facets.forEach((facetResponse) =>
          mutateStateFromFacetResponse(
            state[facetResponse.facetId],
            facetResponse
          )
        );
      })
      .addCase(selectFacetSearchResult, (state, action) => {
        const {facetId, value} = action.payload;
        const facetRequest = state[facetId];

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
        insertValueBeforeIdleValues(facetRequest, searchResultValue);
        facetRequest.freezeCurrentValues = true;
        facetRequest.preventAutoSelect = true;
      });
  }
);

function insertValueBeforeIdleValues(
  facetRequest: FacetRequest,
  facetValue: FacetValueRequest
) {
  const {currentValues} = facetRequest;
  const firstIdleIndex = currentValues.findIndex((v) => v.state === 'idle');
  const indexToInsertAt =
    firstIdleIndex === -1 ? currentValues.length : firstIdleIndex;

  const valuesBefore = currentValues.slice(0, indexToInsertAt);
  const valuesAfter = currentValues.slice(indexToInsertAt + 1);

  facetRequest.currentValues = [...valuesBefore, facetValue, ...valuesAfter];
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
  // TODO: Remove on next major version
  delimitingCharacter: '>',
  filterFacetCount: true,
  injectionDepth: 1000,
  numberOfValues: 8,
  sortCriteria: 'automatic',
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
