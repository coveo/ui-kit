import {
  GeneratedAnswerStyle,
  GeneratedContentFormat,
} from '../../features/generated-answer/generated-response-format';
import {Raw} from '../search/search/raw';

export type GeneratedAnswerStreamFinishReason = 'COMPLETED' | 'ERROR';

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
  clickUri?: string;
  text?: string;
  fields?: Raw;
}

export interface GeneratedAnswerHeaderMessagePayload {
  answerStyle: GeneratedAnswerStyle;
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
