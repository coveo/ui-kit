import {Reducer, createReducer} from '@reduxjs/toolkit';
import {executeSearch} from '../search/search-actions.js';
import {
  applyQueryTriggerModification,
  updateIgnoreQueryTrigger,
} from './triggers-actions.js';
import {
  FunctionExecutionTrigger,
  TriggerState,
  getTriggerInitialState,
} from './triggers-state.js';

export const triggerReducer : Reducer<TriggerState> = createReducer(
  getTriggerInitialState(),
  (builder) =>
    builder
      .addCase(executeSearch.pending, (state) => {
        state.query = '';
        state.queryModification = {
          originalQuery: '',
          newQuery: '',
          queryToIgnore: state.queryModification.queryToIgnore,
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
        state.query = state.queryModification.newQuery;
        state.executions = executeTriggers;
        state.notifications = notifyTriggers;
      })
      .addCase(applyQueryTriggerModification, (state, action) => {
        state.queryModification = {...action.payload, queryToIgnore: ''};
      })
      .addCase(updateIgnoreQueryTrigger, (state, action) => {
        state.queryModification.queryToIgnore = action.payload;
      })
);
