import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../../search/search-actions';
import {
  setDesiredCount,
  toggleSelectAutomaticFacetValue,
} from './automatic-facet-set-actions';
import {getAutomaticFacetsInitialState} from './automatic-facet-set-state';

export const automaticFacetSetReducer = createReducer(
  getAutomaticFacetsInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, (state, action) => {
        const facets = action.payload.response.generateAutomaticFacets?.facets;
        facets?.forEach((facet) => {
          state.facets[facet.field] = facet;
        });
      })

      .addCase(setDesiredCount, (state, action) => {
        state.desiredCount = action.payload;
      })
      .addCase(toggleSelectAutomaticFacetValue, (state, action) => {
        //???????????
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
      });
  }
);

// .addCase(restoreSearchParameters, (state, action) => {
//     //register facets
//   })

//       .addCase(deselectAllAutomaticFacet, (state, action) => {})
//       .addCase(deselectAllBreadcrumbs, (state, action) => {});
