import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';

export interface GeneratedAnswerState {
  /**
   * Determines if the generated answer is visible.
   */
  isVisible: boolean;
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
   * The document snippets retrieved to generate the answer.
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
   * Determines if the feedback modal is currently opened.
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
    isVisible: true,
    isLoading: false,
    isStreaming: false,
    citations: [],
    liked: false,
    disliked: false,
    feedbackModalOpen: false,
  };
}
