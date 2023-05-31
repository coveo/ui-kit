import {createReducer} from '@reduxjs/toolkit';
import {registerSortCriterion, updateSortCriterion} from './sort-actions';
import {getSortInitialState} from './sort-state';

export const sortReducer = createReducer(getSortInitialState(), (builder) => {
  builder
    .addCase(registerSortCriterion, (_, action) => action.payload)
    .addCase(updateSortCriterion, (_, action) => action.payload);
});
