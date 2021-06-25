import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {getTriggerInitialState} from './triggers-state';
import {
  Trigger,
  TriggerRedirect,
  isRedirectTrigger,
  isQueryTrigger,
  TriggerQuery,
} from './../../api/search/trigger';
import {clearQueryTrigger} from './trigger-actions';

export const triggerReducer = createReducer(
  getTriggerInitialState(),
  (builder) =>
    builder
      .addCase(executeSearch.fulfilled, (state, action) => {
        const redirectTriggers: Trigger[] = action.payload.response.triggers.filter(
          (trigger) => isRedirectTrigger(trigger)
        );
        state.redirectTo = redirectTriggers.length
          ? (redirectTriggers[0] as TriggerRedirect).content
          : '';

        const queryTriggers: Trigger[] = action.payload.response.triggers.filter(
          (trigger) => isQueryTrigger(trigger)
        );
        state.query = queryTriggers.length
          ? (queryTriggers[0] as TriggerQuery).content
          : '';
      })
      .addCase(clearQueryTrigger, (state) => {
        state.query = '';
      })
);
