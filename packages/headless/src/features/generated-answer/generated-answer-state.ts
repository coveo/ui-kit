import {GeneratedAnswerCitation} from '../../api/generated-answer/generated-answer-event-payload';

export interface GeneratedAnswerState {
  isLoading: boolean;
  answer?: string;
  citations: GeneratedAnswerCitation[];
  error?: {
    message?: string;
    code?: number;
  };
}

export function getGeneratedAnswerInitialState(): GeneratedAnswerState {
  return {
    isLoading: false,
    citations: [],
  };
}
