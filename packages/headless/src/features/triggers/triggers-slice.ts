import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {undoQueryTrigger} from './triggers-actions';
import {
  FunctionExecutionTrigger,
  getTriggerInitialState,
} from './triggers-state';

export const triggerReducer = createReducer(
  getTriggerInitialState(),
  (builder) =>
    builder
      .addCase(executeSearch.fulfilled, (state, action) => {
        const redirectTriggers: string[] = [];
        const queryTriggers: string[] = [];
        const executeTriggers: FunctionExecutionTrigger[] = [];
        const notifyTriggers: string[] = [];

        action.payload.response.triggers.forEach((trigger) => {
          switch (trigger.type) {
            case 'redirect':
              redirectTriggers.push(trigger.content);
              break;
            case 'query':
              if (trigger.content !== state.queryTriggerToIgnore) {
                queryTriggers.push(trigger.content);
              }

              break;
            case 'execute':
              executeTriggers.push({
                functionName: trigger.content.name,
                params: trigger.content.params,
              });
              break;
            case 'notify':
              notifyTriggers.push(trigger.content);
              break;
          }
        });

        state.redirectTo = redirectTriggers[0] ?? '';

        state.query = queryTriggers[0] ?? '';

        state.execute = executeTriggers[0] ?? {functionName: '', params: []};
        state.executions = executeTriggers;

        state.notification = notifyTriggers[0] ?? '';
        state.notifications = notifyTriggers;
      })
      .addCase(undoQueryTrigger, (state, action) => {
        state.queryTriggerToIgnore = action.payload;
      })
);
