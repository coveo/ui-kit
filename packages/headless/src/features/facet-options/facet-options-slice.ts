import {Reducer, createReducer} from '@reduxjs/toolkit';
import {registerCategoryFacet} from '../facets/category-facet-set/category-facet-set-actions.js';
import {registerFacet} from '../facets/facet-set/facet-set-actions.js';
import {registerDateFacet} from '../facets/range-facets/date-facet-set/date-facet-actions.js';
import {registerNumericFacet} from '../facets/range-facets/numeric-facet-set/numeric-facet-actions.js';
import {change} from '../history/history-actions.js';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions.js';
import {executeSearch} from '../search/search-actions.js';
import {
  disableFacet,
  enableFacet,
  updateFacetOptions,
} from './facet-options-actions.js';
import {
  getFacetOptionsSliceInitialState,
  getFacetOptionsInitialState,
  FacetOptionsState,
} from './facet-options-state.js';

export const facetOptionsReducer: Reducer<FacetOptionsState> = createReducer(
  getFacetOptionsInitialState(),
  (builder) => {
    builder
      .addCase(updateFacetOptions, (state, action) => {
        return {...state, ...action.payload};
      })
      .addCase(executeSearch.fulfilled, (state) => {
        state.freezeFacetOrder = false;
      })
      .addCase(executeSearch.rejected, (state) => {
        state.freezeFacetOrder = false;
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.facetOptions ?? state
      )
      .addCase(registerCategoryFacet, (state, action) => {
        state.facets[action.payload.facetId] =
          getFacetOptionsSliceInitialState();
      })
      .addCase(registerFacet, (state, action) => {
        state.facets[action.payload.facetId] =
          getFacetOptionsSliceInitialState();
      })
      .addCase(registerDateFacet, (state, action) => {
        state.facets[action.payload.facetId] =
          getFacetOptionsSliceInitialState();
      })
      .addCase(registerNumericFacet, (state, action) => {
        state.facets[action.payload.facetId] =
          getFacetOptionsSliceInitialState();
      })
      .addCase(enableFacet, (state, action) => {
        state.facets[action.payload].enabled = true;
      })
      .addCase(disableFacet, (state, action) => {
        state.facets[action.payload].enabled = false;
      })
      .addCase(restoreSearchParameters, (state, action) => {
        [
          ...Object.keys(action.payload.f ?? {}),
          ...Object.keys(action.payload.fExcluded ?? {}),
          ...Object.keys(action.payload.cf ?? {}),
          ...Object.keys(action.payload.nf ?? {}),
          ...Object.keys(action.payload.df ?? {}),
        ].forEach((facetId) => {
          if (!(facetId in state)) {
            state.facets[facetId] = getFacetOptionsSliceInitialState();
          }
          state.facets[facetId].enabled = true;
        });
      });
  }
);
