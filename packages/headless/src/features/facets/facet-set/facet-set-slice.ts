import {createReducer} from '@reduxjs/toolkit';
import {change} from '../../history/history-actions';
import {
  registerFacet,
  toggleSelectFacetValue,
  deselectAllFacetValues,
  updateFacetSortCriterion,
  updateFacetNumberOfValues,
} from './facet-set-actions';
import {executeSearch} from '../../search/search-actions';
import {selectFacetSearchResult} from '../facet-search-set/facet-search-actions';
import {FacetRequest, FacetValueRequest} from './interfaces/request';
import {FacetValue, FacetResponse} from './interfaces/response';
import {FacetRegistrationOptions} from './interfaces/options';

export type FacetSetState = Record<string, FacetRequest>;

export function getFacetSetInitialState(): FacetSetState {
  return {};
}

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
        const id = action.payload;
        const facetRequest = state[id];

        if (!facetRequest) {
          return;
        }

        facetRequest.currentValues.forEach(
          (request) => (request.state = 'idle')
        );
        facetRequest.preventAutoSelect = true;
      })
      .addCase(updateFacetSortCriterion, (state, action) => {
        const {facetId, criterion} = action.payload;
        const facetRequest = state[facetId];

        if (!facetRequest) {
          return;
        }

        facetRequest.sortCriteria = criterion;
      })
      .addCase(updateFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;
        const facetRequest = state[facetId];

        if (!facetRequest) {
          return;
        }

        facetRequest.numberOfValues = numberOfValues;
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
        const matchingValues = facetRequest.currentValues.filter(
          (v) => v.value === rawValue
        );

        if (matchingValues.length) {
          return;
        }

        const currentValue: FacetValueRequest = {
          value: rawValue,
          state: 'selected',
        };

        facetRequest.currentValues.push(currentValue);
      });
  }
);

function buildFacetRequest(config: FacetRegistrationOptions): FacetRequest {
  return {
    type: 'specific',
    currentValues: [],
    delimitingCharacter: '>',
    filterFacetCount: true,
    freezeCurrentValues: false,
    injectionDepth: 1000,
    isFieldExpanded: false,
    numberOfValues: 8,
    preventAutoSelect: false,
    sortCriteria: 'score',
    ...config,
  };
}

export function convertFacetValueToRequest(
  facetValue: FacetValue
): FacetValueRequest {
  const {value, state} = facetValue;

  return {value, state};
}
