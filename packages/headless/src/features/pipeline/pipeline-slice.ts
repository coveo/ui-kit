import {createReducer} from '@reduxjs/toolkit';
import {setPipeline} from './pipeline-actions';
import {change} from '../history/history-actions';
import {updateSearchConfiguration} from '../configuration/configuration-actions';
import {getPipelineInitialState} from './pipeline-state';

export const pipelineReducer = createReducer(
  getPipelineInitialState(),
  (builder) => {
    builder
      .addCase(setPipeline, (_, action) => action.payload)
      .addCase(change.fulfilled, (_, action) => action.payload.pipeline)
      .addCase(
        updateSearchConfiguration,
        (state, action) => action.payload.pipeline || state
      );
  }
);
