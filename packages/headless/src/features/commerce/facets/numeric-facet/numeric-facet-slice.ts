import {createReducer} from '@reduxjs/toolkit';
import {updateManualNumericFacetRange} from './numeric-facet-actions';
import {getNumericFacetInitialState} from './numeric-facet-state';

export const numericFacetReducer = createReducer(
  getNumericFacetInitialState(),
  (builder) =>
    builder.addCase(updateManualNumericFacetRange, (state, action) => {
      state.manualRange = action.payload;
    })
);
