import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine.js';
import {pipelineReducer as pipeline} from '../../features/pipeline/pipeline-slice.js';
import {setPipeline} from './pipeline-actions.js';

/**
 * The pipeline action creators.
 */
export interface PipelineActionCreators {
  /**
   * Sets the query pipeline.
   *
   * @param pipeline - The query pipeline to set (may be empty).
   * @returns A dispatchable action.
   */
  setPipeline(pipeline: string): PayloadAction<string>;
}

/**
 * Loads the `pipeline` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadPipelineActions(
  engine: CoreEngine
): PipelineActionCreators {
  engine.addReducers({pipeline});

  return {
    setPipeline,
  };
}
