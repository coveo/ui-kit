export enum StreamFinishReason {
  Completed = 'COMPLETED',
  Error = 'ERROR',
}

export enum GeneratedAnswerPayloadType {
  Message = 'genqa.messageType',
  Citations = 'genqa.citationsType',
}

export interface GeneratedAnswerInlineCitation {
  inlineRef: string;
  id: string;
  title: string;
  permanentid: string;
  uri?: string;
  clickableuri?: string;
}

export interface GeneratedAnswerCitation {
  id: string;
  title: string;
  clickableuri: string;
  permanentid: string;
  score: string; // or number
}

export interface GeneratedAnswerMessagePayload {
  textDelta: string;
  inlineCitations: GeneratedAnswerInlineCitation[];
}

export interface GeneratedAnswerCitationsPayload {
  citations: GeneratedAnswerCitation[];
}

export interface GeneratedAnswerStreamEventData {
  payloadType?: GeneratedAnswerPayloadType;
  payload: string; // GeneratedAnswerMessagePayload | GeneratedAnswerCitationsPayload;
  finishReason?: StreamFinishReason;
  errorMessage?: string;
  errorCode?: number;
}
