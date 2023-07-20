import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';

export interface GeneratedAnswerState {
  isLoading: boolean;
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
    citations: [],
    liked: false,
    disliked: false,
  };
}
