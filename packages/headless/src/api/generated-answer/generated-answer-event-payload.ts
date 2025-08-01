import type {GeneratedContentFormat} from '../../features/generated-answer/generated-response-format.js';
import type {Raw} from '../search/search/raw.js';

type GeneratedAnswerStreamFinishReason = 'COMPLETED' | 'ERROR';

export type GeneratedAnswerPayloadType =
  | 'genqa.headerMessageType'
  | 'genqa.messageType'
  | 'genqa.citationsType'
  | 'genqa.endOfStreamType';

export interface GeneratedAnswerCitation {
  id: string;
  title: string;
  uri: string;
  permanentid: string;
  source: string;
  clickUri?: string;
  text?: string;
  fields?: Raw;
}

export interface GeneratedAnswerHeaderMessagePayload {
  contentFormat: GeneratedContentFormat;
}

export interface GeneratedAnswerMessagePayload {
  textDelta: string;
}

export interface GeneratedAnswerCitationsPayload {
  citations: GeneratedAnswerCitation[];
}

export interface GeneratedAnswerEndOfStreamPayload {
  answerGenerated: boolean;
}

export interface GeneratedAnswerStreamEventData {
  payloadType?: GeneratedAnswerPayloadType;
  payload: string;
  finishReason?: GeneratedAnswerStreamFinishReason;
  errorMessage?: string;
  statusCode?: number;
}
