import {createReducer} from '@reduxjs/toolkit';
import {updateAdvancedSearchQueries} from '../advanced-search-queries/advanced-search-queries-actions';
import {isUndefined} from '@coveo/bueno';
import {getDefaultConstantQueryFilterInitialState} from './default-constant-query-filter-state';
import {setDefaultConstantQueryFilter} from './default-constant-query-filter-actions';

export const defaultConstantQueryFilterReducer = createReducer(
  getDefaultConstantQueryFilterInitialState(),
  (builder) =>
    builder
      .addCase(updateAdvancedSearchQueries, (state, action) =>
        isUndefined(action.payload.cq)
          ? state
          : {...state, actualValueWasChanged: true}
      )
      .addCase(setDefaultConstantQueryFilter, (state, action) => ({
        ...state,
        defaultValue: action.payload,
      }))
);
