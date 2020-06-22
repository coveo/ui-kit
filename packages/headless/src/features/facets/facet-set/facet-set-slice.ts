import {createReducer} from '@reduxjs/toolkit';
import {registerFacet} from './facet-set-actions';
import {FacetRequest} from './facet-set-interfaces';

export type FacetSetState = Record<string, FacetRequest>;

export function getFacetSetInitialState(): FacetSetState {
  return {};
}

export const facetSetReducer = createReducer(
  getFacetSetInitialState(),
  (builder) => {
    builder.addCase(registerFacet, (state, action) => {
      const {facetId} = action.payload;

      if (facetId in state) {
        return;
      }

      state[facetId] = buildFacetRequest(action.payload);
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
