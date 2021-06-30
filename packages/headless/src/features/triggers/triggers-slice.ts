import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {getTriggerInitialState} from './triggers-state';
import {
  isRedirectTrigger,
  isQueryTrigger,
  isNotifyTrigger,
  Trigger,
  TriggerNotify,
} from './../../api/search/trigger';

export const triggerReducer = createReducer(
  getTriggerInitialState(),
  (builder) =>
    builder.addCase(executeSearch.fulfilled, (state, action) => {
      const redirectTriggers = action.payload.response.triggers.filter(
        isRedirectTrigger
      );
      state.redirectTo = redirectTriggers.length
        ? redirectTriggers[0].content
        : '';

      const queryTriggers = action.payload.response.triggers.filter(
        isQueryTrigger
      );
      state.query = queryTriggers.length ? queryTriggers[0].content : '';

      const notifyTriggers: Trigger[] = action.payload.response.triggers.filter(
        (trigger) => isNotifyTrigger(trigger)
      );
      state.notification = notifyTriggers.length
        ? (notifyTriggers[0] as TriggerNotify).content
        : '';
    })
);
