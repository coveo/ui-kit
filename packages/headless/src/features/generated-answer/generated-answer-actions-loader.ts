import {PayloadAction} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine.js';
import {NoopUpdateCitationsHook} from '../../controllers/core/generated-answer/headless-core-generated-answer.js';
import {GeneratedAnswerProps} from '../../controllers/generated-answer/headless-generated-answer.js';
import {resetAnswer} from './generated-answer-actions.js';
import {generatedAnswerReducer} from './generated-answer-slice.js';

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
  engine: CoreEngine,
  props: GeneratedAnswerProps
): GeneratedAnswerActionCreators {
  const generatedAnswer = generatedAnswerReducer(
    props.onUpdateCitations ?? NoopUpdateCitationsHook
  );

  engine.addReducers({generatedAnswer});

  return {
    resetAnswer,
  };
}
