import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {getTriggerInitialState} from './triggers-state';
import {
  isRedirectTrigger,
  isQueryTrigger,
  isExecuteTrigger,
  isNotifyTrigger,
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

      const executeTriggers = action.payload.response.triggers.filter(
        isExecuteTrigger
      );
      state.execute = executeTriggers.length
        ? {
            functionName: executeTriggers[0].content.name,
            params: executeTriggers[0].content.params,
          }
        : {functionName: '', params: []};
      const notifyTriggers = action.payload.response.triggers.filter(
        isNotifyTrigger
      );
      state.notification = notifyTriggers.length
        ? notifyTriggers[0].content
        : '';
    })
);
