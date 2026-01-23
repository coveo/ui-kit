import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import type {GeneratedContentFormat} from '../../../../features/generated-answer/generated-response-format.js';
import type {GeneratedAnswerCitation} from '../../../generated-answer/generated-answer-event-payload.js';

type PayloadType =
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

export type EventType = PayloadType | 'error';

export interface StreamPayload {
  textDelta?: string;
  padding?: string;
  answerGenerated?: boolean;
  contentFormat: GeneratedContentFormat;
  citations: GeneratedAnswerCitation[];
}

export interface StreamingStrategy<TState> {
  handleOpen: (
    response: Response,
    dispatch: ThunkDispatch<TState, unknown, UnknownAction>
  ) => void;

  handleClose?: (
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
}
