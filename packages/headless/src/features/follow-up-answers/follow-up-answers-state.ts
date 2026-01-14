import type {GeneratedAnswerBase} from '../generated-answer/generated-answer-state.js';

export interface FollowUpAnswer extends GeneratedAnswerBase {
  /** The question prompted to generate this follow-up answer. */
  question: string;
}

/**
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

export const createInitialFollowUpAnswer = (
  followUpQuestion: string
): FollowUpAnswer => ({
  question: followUpQuestion,
  isLoading: false,
  isStreaming: false,
  citations: [],
  liked: false,
  disliked: false,
  feedbackSubmitted: false,
  isAnswerGenerated: false,
  cannotAnswer: false,
});
