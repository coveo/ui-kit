import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {GeneratedResponseFormat} from './generated-response-format';

export interface GeneratedAnswerState {
  /**
   * Determines if the engine has an answer stream manager.
   */
  hasAnswerStreamManager: boolean;
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
   * The desired format options for the generated answer.
   */
  responseFormat: GeneratedResponseFormat;
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
  /**
   * Determines if the generated answer feedback was submitted.
   */
  feedbackSubmitted: boolean;
  /**
   * A list of indexed fields to include in the citations returned with the generated answer.
   */
  fieldsToIncludeInCitations: string[];
  /**
   * Whether the current answer stream should be aborted.
   */
  shouldAbortStream: boolean;
  /**
   * Whether an answer stream should be started.
   */
  shouldStartStream: boolean;
  /**
   * The current answer stream id.
   */
  currentStreamId?: string;
}

export function getGeneratedAnswerInitialState(): GeneratedAnswerState {
  return {
    hasAnswerStreamManager: false,
    isVisible: true,
    isLoading: false,
    isStreaming: false,
    citations: [],
    liked: false,
    disliked: false,
    responseFormat: {
      answerStyle: 'default',
    },
    feedbackModalOpen: false,
    feedbackSubmitted: false,
    fieldsToIncludeInCitations: [],
    shouldAbortStream: false,
    shouldStartStream: false,
    currentStreamId: undefined,
  };
}
