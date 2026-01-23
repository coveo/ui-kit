import type {GeneratedAnswerServerState} from '../../answer-generation-api-state.js';
import {
  endStreaming,
  initializeStreamingAnswer,
  setAnswer,
  setAnswerError,
  setAnswerId,
  setCitations,
} from '../answer-draft-reducer/answer-draft-reducer.js';
import type {EventType, Message, StreamPayload} from '../types.js';

/**
 * Event handler interface for managing answer server state updates during answer streaming.
 */
interface ServerStateEventHandler<TDraft = GeneratedAnswerServerState> {
  /**
   * Extracts and stores the answer ID from response headers.
   */
  handleOpen: (
    response: Response,
    updateCachedData: (updater: (draft: TDraft) => void) => void
  ) => void;

  /**
   * Handlers for different streaming message types that update cached server state.
   */
  handleMessage: Partial<
    Record<
      EventType,
      (
        message: Message,
        updateCachedData: (updater: (draft: TDraft) => void) => void
      ) => void
    >
  >;

  handleError?: (error: unknown) => void;
}

/**
 * Manages answer server state updates during answer generation streaming.
 */
export const serverStateEventHandler: ServerStateEventHandler = {
  handleOpen: (response, updateCachedData) => {
    const answerId = response.headers.get('x-answer-id');
    if (answerId) {
      updateCachedData((draft) => {
        setAnswerId(draft, answerId);
      });
    }
  },

  handleMessage: {
    'genqa.headerMessageType': (message, updateCachedData) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      if (payload.contentFormat) {
        updateCachedData((draft) => {
          initializeStreamingAnswer(draft, payload);
        });
      }
    },

    'genqa.messageType': (message, updateCachedData) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      if (payload.textDelta) {
        updateCachedData((draft) => {
          setAnswer(draft, payload);
        });
      }
    },

    'genqa.citationsType': (message, updateCachedData) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      if (payload.citations) {
        updateCachedData((draft) => {
          setCitations(draft, payload);
        });
      }
    },

    'genqa.endOfStreamType': (message, updateCachedData) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      updateCachedData((draft) => {
        endStreaming(draft, payload);
      });
    },

    error: (message, updateCachedData) => {
      if (message.finishReason === 'ERROR') {
        updateCachedData((draft) => {
          setAnswerError(draft, message);
        });
      }
    },
  },
};
