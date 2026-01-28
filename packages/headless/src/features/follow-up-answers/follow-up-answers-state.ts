import type {GeneratedAnswerBase} from '../generated-answer/generated-answer-state.js';

/**
 * @internal
 * Represents a follow-up answer generated in response to a user's question.
 * Extends the base generated answer structure with the originating question.
 */
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
  followUpAnswers: FollowUpAnswer[];
}

export function getFollowUpAnswersInitialState(): FollowUpAnswersState {
  return {
    id: '',
    isEnabled: false,
    followUpAnswers: [],
  };
}
