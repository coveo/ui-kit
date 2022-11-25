import {createReducer} from '@reduxjs/toolkit';
import {updateSearchConfiguration} from '../configuration/configuration-actions';
import {change} from '../history/history-actions';
import {setPipeline} from './pipeline-actions';
import {getPipelineInitialState} from './pipeline-state';

export const pipelineReducer = createReducer(
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
