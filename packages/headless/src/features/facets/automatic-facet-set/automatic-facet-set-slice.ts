import {createReducer} from '@reduxjs/toolkit';
import {FacetValue} from '../../../product-listing.index';
import {change} from '../../history/history-actions';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';
import {executeSearch} from '../../search/search-actions';
import {
  deselectAllAutomaticFacetValues,
  setDesiredCount,
  toggleSelectAutomaticFacetValue,
} from './automatic-facet-set-actions';
import {getAutomaticFacetSetInitialState} from './automatic-facet-set-state';
import {AutomaticFacetResponse} from './interfaces/response';

export const automaticFacetSetReducer = createReducer(
  getAutomaticFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.set = {};

        const facets = action.payload.response.generateAutomaticFacets?.facets;
        facets?.forEach((response) => {
          state.set[response.field] = {response};
        });
      })
      .addCase(setDesiredCount, (state, action) => {
        state.desiredCount = action.payload;
      })
      .addCase(toggleSelectAutomaticFacetValue, (state, action) => {
        const {field, selection} = action.payload;
        const facet = state.set[field]?.response;

        if (!facet) {
          return;
        }
        const value = facet.values.find(
          (value) => value.value === selection.value
        );
        if (!value) {
          return;
        }
        const isSelected = value.state === 'selected';
        value.state = isSelected ? 'idle' : 'selected';
      })
      .addCase(deselectAllAutomaticFacetValues, (state, action) => {
        const field = action.payload;
        const facet = state.set[field]?.response;

        if (!facet) {
          return;
        }
        for (const value of facet.values) {
          value.state = 'idle';
        }
      })
      .addCase(restoreSearchParameters, (state, action) => {
        const af = action.payload.af ?? {};
        state.set = {};

        for (const field in af) {
          const response = buildTemporaryAutomaticFacetResponse(field);
          const values = af[field].map((value) =>
            buildTemporarySelectedFacetValue(value)
          );
          response.values.push(...values);

          state.set[field] = {response};
        }
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.automaticFacetSet ?? state
      );
  }
);

function buildTemporaryAutomaticFacetResponse(
  field: string
): AutomaticFacetResponse {
  return {
    field,
    values: [],
    moreValuesAvailable: false,
    label: '',
    indexScore: 0,
  };
}

function buildTemporarySelectedFacetValue(value: string): FacetValue {
  return {
    value,
    state: 'selected',
    numberOfResults: 0,
  };
}
