export enum GeneratedAnswerStreamFinishReason {
  Completed = 'COMPLETED',
  Error = 'ERROR',
}

export enum GeneratedAnswerPayloadType {
  Message = 'genqa.messageType',
  Citations = 'genqa.citationsType',
}

export interface GeneratedAnswerCitation {
  id: string;
  title: string;
  uri: string;
  permanentid: string;
  clickUri?: string;
}

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
