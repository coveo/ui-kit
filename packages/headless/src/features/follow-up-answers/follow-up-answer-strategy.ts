import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {StreamPayload} from '../../api/knowledge/answer-generation/shared-types.js';
import type {StreamingStrategy} from '../../api/knowledge/answer-generation/streaming/strategies/strategy-types.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from '../generated-answer/generated-answer-analytics-actions.js';
import {
  setActiveFollowUpAnswerContentFormat,
  setActiveFollowUpAnswerId,
  setActiveFollowUpCannotAnswer,
  setActiveFollowUpIsAnswerGenerated,
  setActiveFollowUpIsLoading,
  setActiveFollowUpIsStreaming,
  updateActiveFollowUpAnswerCitations,
  updateActiveFollowUpAnswerMessage,
} from './follow-up-answers-actions.js';

export const followUpAnswerStrategy: StreamingStrategy<AnswerGenerationApiState> =
  {
    handleOpen: (response, dispatch) => {
      const answerId = response.headers.get('x-answer-id');
      if (answerId) {
        dispatch(setActiveFollowUpAnswerId(answerId));
      }
    },

    handleError: (error) => {
      throw error;
    },

    handleMessage: {
      'genqa.headerMessageType': (message, dispatch) => {
        const payload: StreamPayload = message.payload.length
          ? JSON.parse(message.payload)
          : {};
        if (payload.contentFormat) {
          dispatch(setActiveFollowUpAnswerContentFormat(payload.contentFormat));
          dispatch(setActiveFollowUpIsStreaming(true));
          dispatch(setActiveFollowUpIsLoading(false));
        }
      },

      'genqa.messageType': (message, dispatch) => {
        const payload: StreamPayload = message.payload.length
          ? JSON.parse(message.payload)
          : {};
        if (payload.textDelta) {
          dispatch(
            updateActiveFollowUpAnswerMessage({textDelta: payload.textDelta})
          );
        }
      },

      'genqa.citationsType': (message, dispatch) => {
        const payload: StreamPayload = message.payload.length
          ? JSON.parse(message.payload)
          : {};
        if (payload.citations) {
          dispatch(
            updateActiveFollowUpAnswerCitations({citations: payload.citations})
          );
        }
      },

      'genqa.endOfStreamType': (message, dispatch) => {
        const payload: StreamPayload = message.payload.length
          ? JSON.parse(message.payload)
          : {};
        dispatch(setActiveFollowUpIsAnswerGenerated(!!payload.answerGenerated));
        dispatch(setActiveFollowUpCannotAnswer(!payload.answerGenerated));
        dispatch(setActiveFollowUpIsStreaming(false));
        dispatch(setActiveFollowUpIsLoading(false));
        dispatch(logGeneratedAnswerStreamEnd(payload.answerGenerated ?? false));
        dispatch(logGeneratedAnswerResponseLinked());
      },
      error: (message) => {
        if (message.finishReason === 'ERROR' && message.errorMessage) {
          // should set error state
        }
      },
    },
  };
