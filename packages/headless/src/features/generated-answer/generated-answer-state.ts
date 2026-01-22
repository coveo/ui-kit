import type {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload.js';
import type {AnswerEndpointArgs} from '../../api/knowledge/answer-generation/endpoints/answer/answer-endpoint.js';
import type {AnswerApiQueryParams} from '../../features/generated-answer/generated-answer-request.js';
import type {
  GeneratedContentFormat,
  GeneratedResponseFormat,
} from './generated-response-format.js';

export interface GeneratedAnswerBase {
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
   * Determines if the answer is generated.
   */
  isAnswerGenerated: boolean;
  /**
   * Whether an answer cannot be generated after a query is executed.
   */
  cannotAnswer: boolean;
  /** The unique identifier of the answer returned by the Answer API. */
  answerId?: string;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `GeneratedAnswer` component.
 *
 * @group Controllers
 * @category GeneratedAnswer
 */
export interface GeneratedAnswerState extends GeneratedAnswerBase {
  /**
   * Determines if the generated answer is visible.
   */
  isVisible: boolean;
  /**
   * Whether the answer is expanded.
   */
  expanded: boolean;
  id: string;
  /**
   * Determines if the feedback modal is currently opened.
   */
  feedbackModalOpen: boolean;
  /**
   * Determines if the generated answer is enabled.
   */
  isEnabled: boolean;
  /**
   * The desired format options for the generated answer.
   */
  responseFormat: GeneratedResponseFormat;
  /**
   * A list of indexed fields to include in the citations returned with the generated answer.
   */
  fieldsToIncludeInCitations: string[];
  /**
   * The answer configuration unique identifier.
   */
  answerConfigurationId?: string;
  /**
   * The query parameters used for the answer API request cache key
   */
  answerApiQueryParams?: AnswerApiQueryParams;
  /**
   * The query parameters used for the head answer API request
   */
  headAnswerApiQueryParams?: AnswerEndpointArgs;
  /** The current mode of answer generation. */
  answerGenerationMode: 'automatic' | 'manual';
}

export function getGeneratedAnswerInitialState(): GeneratedAnswerState {
  return {
    id: '',
    isVisible: true,
    isEnabled: true,
    isLoading: false,
    isStreaming: false,
    citations: [],
    liked: false,
    disliked: false,
    responseFormat: {
      contentFormat: ['text/plain'],
    },
    feedbackModalOpen: false,
    feedbackSubmitted: false,
    fieldsToIncludeInCitations: [],
    isAnswerGenerated: false,
    expanded: false,
    cannotAnswer: false,
    answerApiQueryParams: undefined,
    answerId: undefined,
    answerGenerationMode: 'automatic',
  };
}
