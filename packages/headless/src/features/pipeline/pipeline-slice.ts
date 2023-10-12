import {Reducer, createReducer} from '@reduxjs/toolkit';
import {updateSearchConfiguration} from '../configuration/configuration-actions.js';
import {change} from '../history/history-actions.js';
import {setPipeline} from './pipeline-actions.js';
import {getPipelineInitialState} from './pipeline-state.js';

export const pipelineReducer:Reducer = createReducer(
  getPipelineInitialState(),
  (builder) => {
    builder
      .addCase(setPipeline, (_, action) => action.payload)
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.pipeline ?? state
      )
      .addCase(
        updateSearchConfiguration,
        (state, action) => action.payload.pipeline || state
      );
  }
);
