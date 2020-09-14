import {ConstantQueryState} from '../../state';
import {createReducer} from '@reduxjs/toolkit';
import {
  registerConstantQuery,
  updateConstantQuery,
} from './constant-query-actions';
import {change} from '../history/history-actions';

export const getInitialConstantQueryState: () => ConstantQueryState = () => ({
  cq: '',
  isInitialized: false,
});

export const constantQueryReducer = createReducer(
  getInitialConstantQueryState(),
  (builder) => {
    builder
      .addCase(registerConstantQuery, (state, action) => {
        const cq = action.payload;
        if (!state.isInitialized) {
          state.cq = cq;
          state.isInitialized = true;
        }
      })
      .addCase(updateConstantQuery, (state, action) => {
        state.cq = action.payload;
      })
      .addCase(change.fulfilled, (_, action) => action.payload.constantQuery);
  }
);
