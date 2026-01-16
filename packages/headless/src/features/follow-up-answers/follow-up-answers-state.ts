import type {GeneratedAnswerBase} from '../generated-answer/generated-answer-state.js';

interface FollowUpAnswer extends GeneratedAnswerBase {
  /** The question prompted to generate this follow-up answer. */
  question: string;
}

/**
 * @internal
 * The follow-up answers state.
 */
export interface FollowUpAnswersState {
  /** The unique identifier of the follow-up answer session. */
  id: string;
  /**
   * Determines if the follow-up answer feature is enabled.
   */
  isEnabled: boolean;
  /**
   * The follow-up answers.
   */
  answers: FollowUpAnswer[];
  /**
   * Can ask more follow-up answers.
   */
  canAskMore: boolean;
}

export function getFollowUpAnswersInitialState(): FollowUpAnswersState {
  return {
    id: '',
    isEnabled: false,
    answers: [],
    canAskMore: false,
  };
}
