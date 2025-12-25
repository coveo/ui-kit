import type {GeneratedContentFormat} from '../../../features/generated-answer/generated-response-format.js';
import type {GeneratedAnswerCitation} from '../../generated-answer/generated-answer-event-payload.js';

export interface GeneratedAnswerDraft {
  answerId?: string;
  contentFormat?: GeneratedContentFormat;
  answer?: string;
  citations?: GeneratedAnswerCitation[];
  generated?: boolean;
  isStreaming: boolean;
  isLoading: boolean;
  error?: {message: string; code: number};
}

export interface StreamPayload {
  textDelta?: string;
  padding?: string;
  answerGenerated?: boolean;
  contentFormat: GeneratedContentFormat;
  citations: GeneratedAnswerCitation[];
}

export type PayloadType =
  | 'genqa.headerMessageType'
  | 'genqa.messageType'
  | 'genqa.citationsType'
  | 'genqa.endOfStreamType';

export interface Message {
  payloadType: PayloadType;
  payload: string;
  finishReason?: string;
  errorMessage?: string;
  code?: number;
}
