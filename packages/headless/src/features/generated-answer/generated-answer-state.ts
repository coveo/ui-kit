import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';

export interface GeneratedAnswerState {
  enabled: boolean;
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
    enabled: true,
    isLoading: false,
    isStreaming: false,
    citations: [],
    liked: false,
    disliked: false,
  };
}
