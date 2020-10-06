import {createReducer} from '@reduxjs/toolkit';
import {setPipeline} from './pipeline-actions';
import {change} from '../history/history-actions';
import {updateSearchConfiguration} from '../configuration/configuration-actions';

export const getPipelineInitialState = () => 'default';

export const pipelineReducer = createReducer(
  getPipelineInitialState(),
  (builder) => {
    builder
      .addCase(setPipeline, (_, action) => action.payload)
      .addCase(change.fulfilled, (_, action) => action.payload.pipeline)
      .addCase(
        updateSearchConfiguration,
        (_, action) => action.payload.pipeline
      );
  }
);
