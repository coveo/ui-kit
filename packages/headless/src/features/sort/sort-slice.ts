import {createReducer} from '@reduxjs/toolkit';
import {registerSortCriterion, updateSortCriterion} from './sort-actions.js';
import {getSortInitialState} from './sort-state.js';

export const sortReducer = createReducer(getSortInitialState(), (builder) => {
  builder
    .addCase(registerSortCriterion, (_, action) => action.payload)
    .addCase(updateSortCriterion, (_, action) => action.payload);
});
