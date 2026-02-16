import type {GeneratedAnswerBase} from '../generated-answer/generated-answer-state.js';

/**
 * @internal
 * Represents a follow-up answer generated in response to a user's question.
 * Extends the base generated answer structure with the originating question.
 */
export interface FollowUpAnswer extends GeneratedAnswerBase {
  /** The question prompted to generate this follow-up answer. */
  question: string;
  /** Indicates if this follow-up answer is currently active. */
  isActive: boolean;
}

/**
 * @internal
 * The follow-up answers state.
 */
export interface FollowUpAnswersState {
  /** The unique identifier of the follow-up answers conversation. */
  conversationId: string;
  /**
   * Determines if the follow-up answer feature is enabled.
   */
  isEnabled: boolean;
  /**
   * The follow-up answers.
   */
  followUpAnswers: FollowUpAnswer[];
}

export function getFollowUpAnswersInitialState(): FollowUpAnswersState {
  return {
    conversationId: '',
    isEnabled: false,
    followUpAnswers: [],
  };
}

export const createInitialFollowUpAnswer = (
  question: string
): FollowUpAnswer => ({
  question: question,
  isLoading: false,
  isStreaming: false,
  citations: [],
  liked: false,
  disliked: false,
  feedbackSubmitted: false,
  cannotAnswer: false,
  isActive: true,
});
