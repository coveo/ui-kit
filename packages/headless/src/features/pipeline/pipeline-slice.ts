import {createReducer} from '@reduxjs/toolkit';
import {setPipeline} from './pipeline-actions';
import {change} from '../history/history-actions';

export const getPipelineInitialState = () => '';

export const pipelineReducer = createReducer(
  getPipelineInitialState(),
  (builder) => {
    builder
      .addCase(setPipeline, (_, action) => action.payload)
      .addCase(change.fulfilled, (_, action) => action.payload.pipeline);
  }
);
