import type {GeneratedAnswerServerState} from '../../answer-generation-api-state.js';
import {
  endStreaming,
  initializeStreamingAnswer,
  setAnswer,
  setAnswerId,
  setCitations,
} from '../answer-draft-reducer/answer-draft-reducer.js';
import type {EventType, Message} from '../types.js';

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

  // Fired when the SSE connection errors out (network failure, server disconnect,
  //  or an exception thrown in handleOpen/handleMessage)
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
    'agentInteraction.answerHeader': (_message, updateCachedData) => {
      updateCachedData((draft) => {
        initializeStreamingAnswer(draft, {contentFormat: 'text/markdown'});
      });
    },

    'generativeengines.messageType': (message, updateCachedData) => {
      if (message?.payload?.textDelta) {
        updateCachedData((draft) => {
          setAnswer(draft, message.payload);
        });
      }
    },

    'agentInteraction.citations': (message, updateCachedData) => {
      if (message?.payload?.citations !== undefined) {
        updateCachedData((draft) => {
          setCitations(draft, message.payload);
        });
      }
    },

    'generativeengines.endOfStreamType': (message, updateCachedData) => {
      updateCachedData((draft) => {
        endStreaming(draft, message.payload);
      });
    },
  },
};
