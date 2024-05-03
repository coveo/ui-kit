import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {
  GeneratedContentFormat,
  GeneratedResponseFormat,
} from './generated-response-format';

export interface GeneratedAnswerState {
  id: string;
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
   * The content format of the generated answer. Possible values are:
   * - `text/plain`
   * - `text/markdown`
   */
  answerContentFormat?: GeneratedContentFormat;
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
   * Determines if the answer is generated.
   */
  isAnswerGenerated: boolean;
  /**
   * Whether the answer is expanded.
   */
  expanded: boolean;
}

export function getGeneratedAnswerInitialState(): GeneratedAnswerState {
  return {
    id: '',
    isVisible: true,
    isLoading: false,
    isStreaming: false,
    citations: [],
    liked: false,
    disliked: false,
    responseFormat: {
      answerStyle: 'default',
      contentFormat: ['text/plain'],
    },
    feedbackModalOpen: false,
    feedbackSubmitted: false,
    fieldsToIncludeInCitations: [],
    isAnswerGenerated: false,
    expanded: false,
  };
}
