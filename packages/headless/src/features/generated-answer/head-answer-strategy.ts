import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {
  StreamingStrategy,
  StreamPayload,
} from '../../api/knowledge/answer-generation/streaming/types.js';
import {
  setAnswerContentFormat,
  setAnswerId,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  updateCitations,
  updateError,
  updateMessage,
} from './generated-answer-actions.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from './generated-answer-analytics-actions.js';

export const headAnswerStrategy: StreamingStrategy<AnswerGenerationApiState> = {
  handleOpen: (response, dispatch) => {
    const answerId = response.headers.get('x-answer-id');
    if (answerId) {
      dispatch(setAnswerId(answerId));
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
        dispatch(setAnswerContentFormat(payload.contentFormat));
        dispatch(setIsStreaming(true));
        dispatch(setIsLoading(false));
      }
    },

    'genqa.messageType': (message, dispatch) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      if (payload.textDelta) {
        dispatch(updateMessage({textDelta: payload.textDelta}));
      }
    },

    'genqa.citationsType': (message, dispatch) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};
      if (payload.citations) {
        dispatch(updateCitations({citations: payload.citations}));
      }
    },

    'genqa.endOfStreamType': (message, dispatch) => {
      const payload: StreamPayload = message.payload.length
        ? JSON.parse(message.payload)
        : {};

      dispatch(setIsAnswerGenerated(!!payload.answerGenerated));
      dispatch(setIsAnswerGenerated(!!payload.answerGenerated));
      dispatch(setCannotAnswer(!payload.answerGenerated));
      dispatch(setIsStreaming(false));
      dispatch(setIsLoading(false));
      dispatch(logGeneratedAnswerStreamEnd(payload.answerGenerated ?? false));
      dispatch(logGeneratedAnswerResponseLinked());
    },
    error: (message, dispatch) => {
      if (message.finishReason === 'ERROR' && message.errorMessage) {
        dispatch(updateError(message));
      }
    },
  },
};
