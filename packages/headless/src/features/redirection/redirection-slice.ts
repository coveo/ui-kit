import {createReducer} from '@reduxjs/toolkit';
import {RedirectionState} from '../../state';
import {checkForRedirection} from './redirection-actions';

export const getRedirectionInitialState: () => RedirectionState = () => ({
  redirectTo: null,
});

export const redirectionReducer = createReducer(
  getRedirectionInitialState(),
  (builder) =>
    builder.addCase(checkForRedirection.fulfilled, (state, action) => {
      state.redirectTo = action.payload;
    })
);
