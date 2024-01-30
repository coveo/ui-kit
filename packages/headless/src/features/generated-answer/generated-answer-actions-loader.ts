import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine';
import {resetAnswer} from './generated-answer-actions';
import {generatedAnswerReducer as generatedAnswer} from './generated-answer-slice';

/**
 * The generated answer action creators.
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
 */
export function loadGeneratedAnswerActions(
  engine: CoreEngine
): GeneratedAnswerActionCreators {
  engine.addReducers({generatedAnswer});

  return {
    resetAnswer,
  };
}
