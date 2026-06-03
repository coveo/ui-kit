import type {GeneratedContentFormat} from '../../features/generated-answer/generated-response-format.js';
import type {GeneratedAnswerCitation} from '../generated-answer/generated-answer-event-payload.js';

export interface GeneratedAnswerStream {
  answerId?: string;
  contentFormat?: GeneratedContentFormat;
  answer?: string;
  citations?: GeneratedAnswerCitation[];
  generated?: boolean;
  isStreaming: boolean;
  isLoading: boolean;
  error?: {message: string; code: number};
}
