import {createReducer} from '@reduxjs/toolkit';
import {updateClassifications} from './case-assist-actions';
import {getCaseAssistInitialState} from './case-assist-state';

export const caseAssistReducer = createReducer(
  getCaseAssistInitialState(),
  (builder) => {
    builder.addCase(updateClassifications, (state, action) => {
      console.log('LB. Entering updateClassifications reducer');
      console.log(`LB. action: ${JSON.stringify(action)}`);

      console.log(`LB. State (before): ${JSON.stringify(state)}`);

      if (action.payload) {
        state.classifications = {
          now: [Date.now().toString()],
        };
      }

      console.log(`LB. State (after): ${JSON.stringify(state)}`);
    });
  }
);
