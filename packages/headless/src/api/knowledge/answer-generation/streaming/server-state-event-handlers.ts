import type {
  GeneratedAnswerServerState,
  StreamPayload,
} from '../shared-types.js';
import {
  handleAnswerId,
  handleCitations,
  handleEndOfStream,
  handleError,
  handleHeaderMessage,
  handleMessage,
} from './answer-draft-handlers.js';

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

type EventType = PayloadType | 'error';

interface ServerStateEventHandler<TDraft = GeneratedAnswerServerState> {
  handleOpen: (
    response: Response,
    updateCachedData: (updater: (draft: TDraft) => void) => void
  ) => void;

  handleError: (error: unknown) => void;

  handleMessage: Partial<
    Record<
      EventType,
      (
        message: Message,
        updateCachedData: (updater: (draft: TDraft) => void) => void
      ) => void
    >
  >;
}

export const serverStateEventHandler: ServerStateEventHandler = {
  handleOpen: (response, updateCachedData) => {
    const answerId = response.headers.get('x-answer-id');
    if (answerId) {
      updateCachedData((draft) => {
        handleAnswerId(draft, answerId);
      });
    }
  },

  handleError: (error) => {
    throw error;
  },

  handleMessage: {
    'genqa.headerMessageType': (message, updateCachedData) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      if (payload.contentFormat) {
        updateCachedData((draft) => {
          handleHeaderMessage(draft, payload);
        });
      }
    },

    'genqa.messageType': (message, updateCachedData) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      if (payload.textDelta) {
        updateCachedData((draft) => {
          handleMessage(draft, payload);
        });
      }
    },

    'genqa.citationsType': (message, updateCachedData) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      if (payload.citations) {
        updateCachedData((draft) => {
          handleCitations(draft, payload);
        });
      }
    },

    'genqa.endOfStreamType': (message, updateCachedData) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      updateCachedData((draft) => {
        handleEndOfStream(draft, payload);
      });
    },
    error: (message, updateCachedData) => {
      if (message.finishReason === 'ERROR' && message.errorMessage) {
        updateCachedData((draft) => {
          handleError(draft, message);
        });
      }
    },
  },
};
