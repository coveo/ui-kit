export enum GeneratedAnswerStreamFinishReason {
  Completed = 'COMPLETED',
  Error = 'ERROR',
}

export enum GeneratedAnswerPayloadType {
  Message = 'genqa.messageType',
  Citations = 'genqa.citationsType',
}

interface BaseGeneratedAnswerCitation {
  id: string;
  title: string;
  uri: string;
  permanentid: string;
  clickUri?: string;
}

export type GeneratedAnswerCitation = BaseGeneratedAnswerCitation & {
  score: string; // or number
};

export interface GeneratedAnswerMessagePayload {
  textDelta: string;
}

export interface GeneratedAnswerCitationsPayload {
  citations: GeneratedAnswerCitation[];
}

export interface GeneratedAnswerStreamEventData {
  payloadType?: GeneratedAnswerPayloadType;
  payload: string;
  finishReason?: GeneratedAnswerStreamFinishReason;
  errorMessage?: string;
  errorCode?: number;
}
