import {createReducer} from '@reduxjs/toolkit';
import {registerFacet, toggleSelectFacetValue} from './facet-set-actions';
import {
  FacetRequest,
  FacetValue,
  FacetValueRequest,
} from './facet-set-interfaces';
import {executeSearch} from '../../search/search-actions';

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
      .addCase(toggleSelectFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;

        if (!(facetId in state)) {
          return;
        }

        const facetRequest = state[facetId];
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
      .addCase(executeSearch.fulfilled, (state, action) => {
        const facets = action.payload.response.facets;
        facets.forEach((facetResponse) => {
          const id = facetResponse.facetId;
          const facetRequest = state[id];

          if (!facetRequest) {
            return;
          }

          facetRequest.currentValues = facetResponse.values.map(
            buildFacetValueRequest
          );
          facetRequest.freezeCurrentValues = false;
          facetRequest.preventAutoSelect = false;
        });
      });
  }
);

export function buildFacetRequest(
  config: Partial<FacetRequest> = {}
): FacetRequest {
  return {
    type: 'specific',
    facetId: '',
    currentValues: [],
    delimitingCharacter: '>',
    field: '',
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

export function buildFacetValueRequest(
  facetValue: FacetValue
): FacetValueRequest {
  const {value, state} = facetValue;

  return {value, state};
}
