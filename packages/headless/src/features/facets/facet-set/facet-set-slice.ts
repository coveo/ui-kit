import {createReducer} from '@reduxjs/toolkit';
import {change} from '../../history/history-actions';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
  updateFacetIsFieldExpanded,
} from './facet-set-actions';
import {executeSearch} from '../../search/search-actions';
import {selectFacetSearchResult} from '../facet-search-set/specific/specific-facet-search-actions';
import {FacetRequest, FacetValueRequest} from './interfaces/request';
import {FacetValue, FacetResponse} from './interfaces/response';
import {
  FacetOptionalParameters,
  FacetRegistrationOptions,
} from './interfaces/options';
import {
  handleFacetSortCriterionUpdate,
  handleFacetDeselectAll,
  handleFacetUpdateNumberOfValues,
} from '../generic/facet-reducer-helpers';
import {getFacetSetInitialState} from './facet-set-state';
import {clearAllFacetValues} from '../generic/facet-actions';

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
        if (Object.keys(action.payload.facetSet).length === 0) {
          return;
        }

        return action.payload.facetSet;
      })
      .addCase(toggleSelectFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId];

        if (!facetRequest) {
          return;
        }

        const targetValue = facetRequest.currentValues.find(
          (req) => req.value === selection.value
        );

        if (!targetValue) {
          return;
        }

        const isSelected = targetValue.state === 'selected';
        targetValue.state = isSelected ? 'idle' : 'selected';

        facetRequest.freezeCurrentValues = true;
        facetRequest.preventAutoSelect = true;
      })
      .addCase(deselectAllFacetValues, (state, action) => {
        handleFacetDeselectAll<FacetRequest>(state, action.payload);
      })
      .addCase(clearAllFacetValues, (state, _) => {
        Object.keys(state).forEach((facetId) => {
          handleFacetDeselectAll<FacetRequest>(state, facetId);
        });
      })
      .addCase(updateFacetSortCriterion, (state, action) => {
        handleFacetSortCriterionUpdate<FacetRequest>(state, action.payload);
      })
      .addCase(updateFacetNumberOfValues, (state, action) => {
        handleFacetUpdateNumberOfValues<FacetRequest>(state, action.payload);
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
        facets.forEach((facetResponse) => {
          const id = facetResponse.facetId;
          const facetRequest = state[id];

          if (!facetRequest) {
            return;
          }

          facetRequest.currentValues = (facetResponse as FacetResponse).values.map(
            convertFacetValueToRequest
          );
          facetRequest.freezeCurrentValues = false;
          facetRequest.preventAutoSelect = false;
        });
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

        const searchResultValue: FacetValueRequest = {
          value: rawValue,
          state: 'selected',
        };

        const firstIdleIndex = currentValues.findIndex(
          (v) => v.state === 'idle'
        );
        const indexToInsertAt =
          firstIdleIndex === -1 ? currentValues.length : firstIdleIndex;

        const valuesBefore = currentValues.slice(0, indexToInsertAt);
        const valuesAfter = currentValues.slice(indexToInsertAt + 1);

        facetRequest.currentValues = [
          ...valuesBefore,
          searchResultValue,
          ...valuesAfter,
        ];
        facetRequest.numberOfValues = facetRequest.currentValues.length;
      });
  }
);

export const defaultFacetOptions: FacetOptionalParameters = {
  delimitingCharacter: '>',
  filterFacetCount: true,
  injectionDepth: 1000,
  numberOfValues: 8,
  sortCriteria: 'automatic',
};

function buildFacetRequest(config: FacetRegistrationOptions): FacetRequest {
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
