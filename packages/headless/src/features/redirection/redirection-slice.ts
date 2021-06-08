import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {checkForRedirection} from './redirection-actions';
import {getRedirectionInitialState} from './redirection-state';
import {
  Trigger,
  TriggerRedirect,
  isTriggerRedirect,
} from './../../api/search/trigger';

export const redirectionReducer = createReducer(
  getRedirectionInitialState(),
  (builder) =>
    builder
      .addCase(checkForRedirection.fulfilled, (state, action) => {
        state.redirectTo = action.payload;
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const redirectTriggers: Trigger[] = action.payload.response.triggers.filter(
          (trigger) => isTriggerRedirect(trigger)
        );
        state.redirectTo = (redirectTriggers[0] as TriggerRedirect).content;
      })
);
