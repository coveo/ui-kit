import type {PayloadAction} from '@reduxjs/toolkit';
import type {CoreEngine} from '../../app/engine.js';
import {
  generateAnswer,
  resetAnswer,
  setAnswerGenerationMode,
} from './generated-answer-actions.js';
import {generatedAnswerReducer as generatedAnswer} from './generated-answer-slice.js';

/**
 * The generated answer action creators.
 *
 * @group Actions
 * @category GeneratedAnswer
 */
export interface GeneratedAnswerActionCreators {
  /**
   * Generates a new answer using the Answer API.
   *
   * This action requires an answer configuration ID to be set in the engine configuration.
   * When present, it will use the Answer API service for enhanced answer generation.
   *
   * @returns A dispatchable action.
   */
  generateAnswer(): void;

  /**
   * Resets the generated answer state to a clean slate.
   *
   * @returns A dispatchable action.
   */
  resetAnswer(): PayloadAction;

  /**
   * Sets the answer generation mode.
   *
   * This action updates the engine state to indicate whether answer generation
   * should occur automatically or manually.
   */
  setAnswerGenerationMode(mode: 'automatic' | 'manual'): void;
}

/**
 * Loads the `generatedAnswer` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category GeneratedAnswer
 */
export function loadGeneratedAnswerActions(
  engine: CoreEngine
): GeneratedAnswerActionCreators {
  engine.addReducers({generatedAnswer});

  return {
    generateAnswer,
    resetAnswer,
    setAnswerGenerationMode,
  };
}
