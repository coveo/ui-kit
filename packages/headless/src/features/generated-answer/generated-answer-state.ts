import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';
import {GeneratedResponseFormat} from './generated-response-format';

export interface GeneratedAnswerState {
  /**
   * Determines if the generated answer is visible.
   */
  isVisible: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  answer?: string;
  citations: GeneratedAnswerCitation[];
  liked: boolean;
  disliked: boolean;
  responseFormat: GeneratedResponseFormat;
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
    responseFormat: {
      answerStyle: 'default',
    },
  };
}
