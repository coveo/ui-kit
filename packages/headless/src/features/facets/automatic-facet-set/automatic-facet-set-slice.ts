import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../breadcrumb/breadcrumb-actions';
import {executeSearch} from '../../search/search-actions';
import {
  deselectAllAutomaticFacet,
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
      .addCase(deselectAllAutomaticFacet, (state, action) => {
        console.log(state);
        console.log(action);
      })
      .addCase(deselectAllBreadcrumbs, (state, action) => {
        console.log(state);
        console.log(action);
      });
  }
);

// .addCase(restoreSearchParameters, (state, action) => {
//     //register facets
//   })

//
//
