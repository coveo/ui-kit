import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../../search/search-actions';
import {
  deselectAllAutomaticFacetValues,
  setDesiredCount,
  toggleSelectAutomaticFacetValue,
} from './automatic-facet-set-actions';
import {getAutomaticFacetSetInitialState} from './automatic-facet-set-state';

export const automaticFacetSetReducer = createReducer(
  getAutomaticFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.facets = {};

        const facets = action.payload.response.generateAutomaticFacets?.facets;
        facets?.forEach((facet) => {
          state.facets[facet.field] = facet;
        });
      })

      .addCase(setDesiredCount, (state, action) => {
        state.desiredCount = action.payload;
      })
      .addCase(toggleSelectAutomaticFacetValue, (state, action) => {
        const {field, selection} = action.payload;
        const facet = state.facets[field];

        const value = facet.values.find(
          (value) => value.value === selection.value
        );
        if (!value) {
          return;
        }
        const isSelected = value?.state === 'selected';
        value.state = isSelected ? 'idle' : 'selected';
      })
      .addCase(deselectAllAutomaticFacetValues, (state, action) => {
        const field = action.payload;
        const facet = state.facets[field];

        for (let i = 0; i < facet.values.length; i++) {
          facet.values[i].state = 'idle';
        }
      });
  }
);
