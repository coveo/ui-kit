import {createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from './triggers-actions';
import {
  FunctionExecutionTrigger,
  getTriggerInitialState,
} from './triggers-state';

export const triggerReducer = createReducer(
  getTriggerInitialState(),
  (builder) =>
    builder
      .addCase(executeSearch.pending, (state) => {
        state.query = '';
        state.queryModification = {
          originalQuery: '',
          modification: '',
          ignore: state.queryModification.ignore,
        };
      })
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
              queryTriggers.push(trigger.content);

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

        state.query = state.queryModification.modification;

        state.execute = executeTriggers[0] ?? {functionName: '', params: []};
        state.executions = executeTriggers;

        state.notification = notifyTriggers[0] ?? '';
        state.notifications = notifyTriggers;
      })
      .addCase(applyQueryTriggerModification, (state, action) => {
        state.queryModification = {...action.payload, ignore: ''};
      })
      .addCase(updateIgnoreQueryTrigger, (state, action) => {
        state.queryModification.ignore = action.payload;
      })
);
