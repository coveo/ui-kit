import {Reducer, createReducer} from '@reduxjs/toolkit';
import {registerSortCriterion, updateSortCriterion} from './sort-actions.js';
import {SortState, getSortInitialState} from './sort-state.js';

export const sortReducer : Reducer<SortState>= createReducer(getSortInitialState(), (builder) => {
  builder
    .addCase(registerSortCriterion, (_, action) => action.payload)
    .addCase(updateSortCriterion, (_, action) => action.payload);
});
