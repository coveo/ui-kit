import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../../search/search-actions';
import {setDesiredCount} from './automatic-facets-actions';
import {getAutomaticFacetsInitialState} from './automatic-facets-state';

export const automaticFacetsReducer = createReducer(
  getAutomaticFacetsInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.facets = action.payload.response.generateAutomaticFacets?.facets;
      })
      .addCase(setDesiredCount, (state, action) => {
        state.desiredCount = action.payload;
      });
  }
);
