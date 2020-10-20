import {createReducer} from '@reduxjs/toolkit';
import {checkForRedirection} from './redirection-actions';

export interface RedirectionState {
  /**
   * The URL to redirect the user to.
   */
  redirectTo: string | null;
}

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
