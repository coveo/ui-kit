import {Raw} from '../search/search/raw';
import {Result} from '../search/search/result';

export type GeneratedAnswerStreamFinishReason = 'COMPLETED' | 'ERROR';

export type GeneratedAnswerPayloadType =
  | 'genqa.messageType'
  | 'genqa.citationsType'
  | 'genqa.endOfStreamType';

export type GeneratedAnswerCitation = Pick<
  Result,
  'title' | 'uri' | 'clickUri'
> & {
  /**
   * The fields of the citation.
   */
  fields?: Raw;
  /**
   * The text of the citation.
   */
  text?: string;
  /**
   * The unique identifier of the citation.
   */
  id: string;
  /**
   * The permanent identifier of the citation.
   */
  permanentid: string;
};

export interface GeneratedAnswerMessagePayload {
  /**
   * The text delta of the message.
   */
  textDelta: string;
}

export interface GeneratedAnswerCitationsPayload {
  /**
   * The citations linked to the answer.
   */
  citations: GeneratedAnswerCitation[];
}

export interface GeneratedAnswerEndOfStreamPayload {
  /**
   * A boolean indicating whether the answer has been generated.
   */
  answerGenerated: boolean;
}

export interface GeneratedAnswerStreamEventData {
  payloadType?: GeneratedAnswerPayloadType;
  payload: string;
  finishReason?: GeneratedAnswerStreamFinishReason;
  errorMessage?: string;
  statusCode?: number;
}
