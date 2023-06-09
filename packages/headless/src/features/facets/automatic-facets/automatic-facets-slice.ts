import {createReducer} from '@reduxjs/toolkit';
import {setDesiredCount} from './automatic-facets-actions';
import {getAutomaticFacetsInitialState} from './automatic-facets-state';

export const automaticFacetsReducer = createReducer(
  getAutomaticFacetsInitialState(),
  (builder) => {
    builder.addCase(setDesiredCount, (state, action) => {
      state.desiredCount = action.payload;
    });
  }
);
