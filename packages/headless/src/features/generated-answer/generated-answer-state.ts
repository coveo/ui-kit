import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload.js';

export interface GeneratedAnswerState {
  isLoading: boolean;
  isStreaming: boolean;
  answer?: string;
  citations: GeneratedAnswerCitation[];
  liked: boolean;
  disliked: boolean;
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
  };
}
