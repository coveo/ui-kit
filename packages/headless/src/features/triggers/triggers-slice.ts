import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {getTriggerInitialState} from './triggers-state';
import {
  Trigger,
  TriggerRedirect,
  isTriggerRedirect,
} from './../../api/search/trigger';

export const triggerReducer = createReducer(
  getTriggerInitialState(),
  (builder) =>
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      const redirectTriggers: Trigger[] = action.payload.response.triggers.filter(
        (trigger) => isTriggerRedirect(trigger)
      );
      state.redirectTo = redirectTriggers.length
        ? (redirectTriggers[0] as TriggerRedirect).content
        : '';
    })
);
