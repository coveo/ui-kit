import {PayloadAction} from '@reduxjs/toolkit';
import {Engine} from '../../app/headless-engine';
import {pipeline} from '../../app/reducers';
import {setPipeline} from './pipeline-actions';

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
  engine: Engine<object>
): PipelineActionCreators {
  engine.addReducers({pipeline});

  return {
    setPipeline,
  };
}
