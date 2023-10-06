import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';

export interface GeneratedAnswerState {
  /**
   * Determines if the generated answer is loading.
   */
  isLoading: boolean;
  /**
   * Determines if the generated answer is streaming.
   */
  isStreaming: boolean;
  /**
   * The generated answer.
   */
  answer?: string;
  /**
   * The citations used to generate the answer.
   */
  citations: GeneratedAnswerCitation[];
  /**
   * Determines if the generated answer is liked, or upvoted by the end user.
   */
  liked: boolean;
  /**
   * Determines if the generated answer is disliked, or downvoted by the end user.
   */
  disliked: boolean;
  /**
   * Determines if the feedback modal with the purpose of explaining why the end user disliked the generated answer is currently opened.
   */
  feedbackModalOpen: boolean;
  /**
   * The generated answer error.
   */
  error?: {
    message?: string;
    code?: number;
    isRetryable?: boolean;
  };
}

export function getGeneratedAnswerInitialState(): GeneratedAnswerState {
  return {
    isLoading: false,
    isStreaming: false,
    citations: [],
    liked: false,
    disliked: false,
    feedbackModalOpen: false,
  };
}
