import type {PayloadAction} from '@reduxjs/toolkit';
import type {CoreEngine} from '../../app/engine.js';
import {resetAnswer} from './generated-answer-actions.js';
import {generatedAnswerReducer as generatedAnswer} from './generated-answer-slice.js';

/**
 * The generated answer action creators.
 *
 * @group Actions
 * @category GeneratedAnswer
 */
export interface GeneratedAnswerActionCreators {
  /**
   * Resets the generated answer state to a clean slate.
   *
   * @returns A dispatchable action.
   */
  resetAnswer(): PayloadAction;
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
    resetAnswer,
  };
}
