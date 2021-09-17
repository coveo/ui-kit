import {createReducer} from '@reduxjs/toolkit';
import {getSortInitialState} from './sort-state';
import {registerSortCriterion, updateSortCriterion} from './sort-actions';

export const sortReducer = createReducer(getSortInitialState(), (builder) => {
  builder
    .addCase(registerSortCriterion, (_, action) => action.payload)
    .addCase(updateSortCriterion, (_, action) => action.payload);
});
