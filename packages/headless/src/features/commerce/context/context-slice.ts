import {createReducer} from '@reduxjs/toolkit';
import {getContextInitialState} from './context-state';
import {setContext} from './context-actions';

export const contextReducer = createReducer(
  getContextInitialState(),

  (builder) => {
    builder
      .addCase(setContext, (state, action) => {
        // TODO: Should we merge with the product listing state containing the url?
        state.context = action.payload;
      });
  }
);
