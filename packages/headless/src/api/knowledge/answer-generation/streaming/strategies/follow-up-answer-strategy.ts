import {
  setActiveFollowUpAnswerContentFormat,
  setActiveFollowUpAnswerId,
  setActiveFollowUpCannotAnswer,
  setActiveFollowUpIsAnswerGenerated,
  setActiveFollowUpIsLoading,
  setActiveFollowUpIsStreaming,
  updateActiveFollowUpAnswerCitations,
  updateActiveFollowUpAnswerMessage,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from '../../../../../features/generated-answer/generated-answer-analytics-actions.js';
import type {AnswerGenerationApiState} from '../../answer-generation-api-state.js';
import type {
  GeneratedAnswerServerState,
  StreamPayload,
} from '../../shared-types.js';
import {buildHeadAnswerEndpointUrl} from '../../url-builders/endpoint-url-builder.js';
import {
  handleAnswerId,
  handleCitations,
  handleEndOfStream,
  handleError,
  handleHeaderMessage,
  handleMessage,
} from '../event-handlers.js';
import type {StreamingStrategy} from './strategy-types.js';

export const followUpAnswerStrategy: StreamingStrategy<
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
        dispatch(setActiveFollowUpAnswerId(answerId));
      }
    },

    handleClose: (updateCachedData, dispatch) => {
      updateCachedData((draft) => {
        dispatch(setActiveFollowUpCannotAnswer(!draft.generated));
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
          dispatch(setActiveFollowUpAnswerContentFormat(payload.contentFormat));
          dispatch(setActiveFollowUpIsStreaming(true));
          dispatch(setActiveFollowUpIsLoading(false));
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
          dispatch(
            updateActiveFollowUpAnswerMessage({textDelta: payload.textDelta})
          );
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
          dispatch(
            updateActiveFollowUpAnswerCitations({citations: payload.citations})
          );
        }
      },

      'genqa.endOfStreamType': (message, updateCachedData, dispatch) => {
        const payload: StreamPayload = message.payload.length
          ? JSON.parse(message.payload)
          : {};
        updateCachedData((draft) => {
          handleEndOfStream(draft, payload);
        });
        dispatch(setActiveFollowUpIsAnswerGenerated(!!payload.answerGenerated));
        dispatch(setActiveFollowUpIsStreaming(false));
        dispatch(setActiveFollowUpIsLoading(false));
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
