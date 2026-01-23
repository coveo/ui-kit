import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import type {GeneratedContentFormat} from '../../../../features/generated-answer/generated-response-format.js';
import type {GeneratedAnswerCitation} from '../../../generated-answer/generated-answer-event-payload.js';

/**
 * Message types received during answer generation streaming.
 */
type PayloadType =
  | 'genqa.headerMessageType'
  | 'genqa.messageType'
  | 'genqa.citationsType'
  | 'genqa.endOfStreamType';

/**
 * Represents a streaming message from the answer generation endpoint.
 */
export interface Message {
  payloadType: PayloadType;
  payload: string;
  finishReason?: string;
  errorMessage?: string;
  code?: number;
}

/**
 * Event types including standard payload types and error events.
 */
export type EventType = PayloadType | 'error';

/**
 * Parsed payload data from streaming messages.
 */
export interface StreamPayload {
  textDelta?: string;
  padding?: string;
  answerGenerated?: boolean;
  contentFormat: GeneratedContentFormat;
  citations: GeneratedAnswerCitation[];
}

/**
 * Strategy interface for handling application-specific streaming events.
 * Defines handlers for connection lifecycle and message processing.
 */
export interface StreamingStrategy<TState> {
  handleOpen: (
    response: Response,
    dispatch: ThunkDispatch<TState, unknown, UnknownAction>
  ) => void;

  handleError: (error: unknown) => void;

  handleMessage: Partial<
    Record<
      EventType,
      (
        message: Required<Message>,
        dispatch: ThunkDispatch<TState, unknown, UnknownAction>
      ) => void
    >
  >;

  handleClose?: (
    dispatch: ThunkDispatch<TState, unknown, UnknownAction>
  ) => void;
}
