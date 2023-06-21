import {createReducer} from '@reduxjs/toolkit';
import {WritableDraft} from 'immer/dist/internal';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../../breadcrumb/breadcrumb-actions';
import {disableFacet} from '../../facet-options/facet-options-actions';
import {change} from '../../history/history-actions';
import {fetchProductListing} from '../../product-listing/product-listing-actions';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';
import {executeSearch, fetchFacetValues} from '../../search/search-actions';
import {getAutomaticFacetId} from '../automatic-facets/automatic-facets-utils';
import {selectFacetSearchResult} from '../facet-search-set/specific/specific-facet-search-actions';
import {updateFacetAutoSelection} from '../generic/facet-actions';
import {
  handleFacetSortCriterionUpdate,
  handleFacetDeselectAll,
  handleFacetUpdateNumberOfValues,
} from '../generic/facet-reducer-helpers';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';
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
import {
  FacetSetState,
  getFacetSetInitialState,
  getFacetSetSliceInitialState,
} from './facet-set-state';
import {FacetOptionalParameters} from './interfaces/options';
import {FacetRequest, FacetValueRequest} from './interfaces/request';
import {FacetValue, FacetResponse} from './interfaces/response';

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

        const generatedKeys = Object.keys(f).filter((key) =>
          key.startsWith('generated_')
        );

        generatedKeys.forEach((id) => {
          const field = id.replace(/^generated_/, '');
          const request = buildFacetRequest({
            facetId: id,
            field,
          });
          request.generated = true;
          state[id] = getFacetSetSliceInitialState(request);
        });

        const facetIds = Object.keys(state);

        facetIds.forEach((id) => {
          const {request} = state[id]!;
          const selectedValues = f[id] || [];
          const idleValues = request.currentValues.filter(
            (facetValue) => !selectedValues.includes(facetValue.value)
          );

          request.currentValues = [
            ...selectedValues.map(buildSelectedFacetValueRequest),
            ...idleValues.map(restoreFacetValueToIdleState),
          ];
          request.preventAutoSelect = selectedValues.length > 0;
          request.numberOfValues = Math.max(
            selectedValues.length,
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
        existingValue.state = isSelected ? 'idle' : 'selected';
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

        const automaticFacets =
          action.payload.response.generateAutomaticFacets?.facets;
        automaticFacets?.forEach((facetResponse) => {
          const facetId = getAutomaticFacetId(facetResponse.field);
          state[facetId] = {
            request: {
              ...buildFacetRequest({...facetResponse, facetId}),
              currentValues: facetResponse.values,
              generated: true,
            },
            hasBreadcrumbs: true,
            generated: true,
          };
        });

        deleteOldAutomaticFacets(state, automaticFacets);
      })
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const facets = action.payload.response?.facets?.results || [];
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
  facetRequest.generated = false;
}

export const defaultFacetOptions: FacetOptionalParameters = {
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
    generated: false,
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

function restoreFacetValueToIdleState(
  facetValue: FacetValueRequest
): FacetValueRequest {
  return {...facetValue, state: 'idle'};
}

function deleteOldAutomaticFacets(
  state: WritableDraft<FacetSetState>,
  automaticFacets: FacetResponse[] | undefined
) {
  const responseFacetIds = automaticFacets?.map((facetResponse) =>
    getAutomaticFacetId(facetResponse.field)
  );

  for (const [facetId, facetSlice] of Object.entries(state)) {
    if (facetSlice.generated === true && !responseFacetIds?.includes(facetId)) {
      delete state[facetId];
    }
  }
}
