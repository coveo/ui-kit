import {
  setAnswerContentFormat,
  setAnswerId,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  updateCitations,
  updateMessage,
} from '../../../../../features/generated-answer/generated-answer-actions.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from '../../../../../features/generated-answer/generated-answer-analytics-actions.js';
import type {
  AnswerGenerationApiState,
  GeneratedAnswerServerState,
} from '../../answer-generation-api-state.js';
import {buildHeadAnswerEndpointUrl} from '../../url-builders/endpoint-url-builder.js';
import {
  handleAnswerId,
  handleCitations,
  handleEndOfStream,
  handleError,
  handleHeaderMessage,
  handleMessage,
  type StreamPayload,
} from '../event-handlers.js';
import type {StreamingStrategy} from './types.js';

export const headAnswerStrategy: StreamingStrategy<
  GeneratedAnswerServerState,
  AnswerGenerationApiState
> = {
  buildEndpointUrl: (state) => buildHeadAnswerEndpointUrl(state),
  events: {
    handleOpen: (response, updateCachedData, dispatch) => {
      const answerId = response.headers.get('x-answer-id');
      if (answerId) {
        updateCachedData((draft) => {
          handleAnswerId(draft, answerId);
        });
        dispatch(setAnswerId(answerId));
      }
    },

    handleClose: (updateCachedData, dispatch) => {
      updateCachedData((draft) => {
        dispatch(setCannotAnswer(!draft.generated));
      });
    },

    handleError: (error) => {
      throw error;
    },

    handleMessage: {
      'genqa.headerMessageType': (message, updateCachedData, dispatch) => {
        const payload: StreamPayload = message.payload.length
          ? JSON.parse(message.payload)
          : {};
        if (payload.contentFormat) {
          updateCachedData((draft) => {
            handleHeaderMessage(draft, payload);
          });
          dispatch(setAnswerContentFormat(payload.contentFormat));
          dispatch(setIsStreaming(true));
          dispatch(setIsLoading(false));
        }
      },

      'genqa.messageType': (message, updateCachedData, dispatch) => {
        const payload: StreamPayload = message.payload.length
          ? JSON.parse(message.payload)
          : {};
        if (payload.textDelta) {
          updateCachedData((draft) => {
            handleMessage(draft, payload);
          });
          dispatch(updateMessage({textDelta: payload.textDelta}));
        }
      },

      'genqa.citationsType': (message, updateCachedData, dispatch) => {
        const payload: StreamPayload = message.payload.length
          ? JSON.parse(message.payload)
          : {};
        if (payload.citations) {
          updateCachedData((draft) => {
            handleCitations(draft, payload);
          });
          dispatch(updateCitations({citations: payload.citations}));
        }
      },

      'genqa.endOfStreamType': (message, updateCachedData, dispatch) => {
        const payload: StreamPayload = message.payload.length
          ? JSON.parse(message.payload)
          : {};
        updateCachedData((draft) => {
          handleEndOfStream(draft, payload);
        });
        dispatch(setIsAnswerGenerated(!!payload.answerGenerated));
        dispatch(setIsStreaming(false));
        dispatch(setIsLoading(false));
        dispatch(logGeneratedAnswerStreamEnd(payload.answerGenerated ?? false));
        dispatch(logGeneratedAnswerResponseLinked());
      },
      error: (message, updateCachedData) => {
        if (message.finishReason === 'ERROR' && message.errorMessage) {
          updateCachedData((draft) => {
            handleError(draft, message);
          });
        }
      },
    },
  },
};
