import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {
  StreamingStrategy,
  StreamPayload,
} from '../../api/knowledge/answer-generation/streaming/types.js';
import {
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
} from './follow-up-answers-actions.js';

export const createFollowUpAnswerStrategy =
  (): StreamingStrategy<AnswerGenerationApiState> => {
    let answerId: string | null = null;

    return {
      handleOpen: (response, dispatch) => {
        answerId = response.headers.get('x-answer-id');
        if (answerId) {
          dispatch(setActiveFollowUpAnswerId(answerId));
          dispatch(setFollowUpIsLoading({answerId, isLoading: true}));
        }
      },

      handleError: (error) => {
        throw error;
      },

      handleMessage: {
        'genqa.headerMessageType': (message, dispatch) => {
          const payload = parsePayload(message.payload);
          if (payload.contentFormat) {
            dispatch(
              setFollowUpAnswerContentFormat({
                contentFormat: payload.contentFormat,
                answerId: answerId!,
              })
            );
          }
        },

        'genqa.messageType': (message, dispatch) => {
          const payload = parsePayload(message.payload);
          if (payload.textDelta) {
            dispatch(
              followUpMessageChunkReceived({
                textDelta: payload.textDelta,
                answerId: answerId!,
              })
            );
          }
        },

        'genqa.citationsType': (message, dispatch) => {
          const payload = parsePayload(message.payload);
          if (payload.citations) {
            dispatch(
              followUpCitationsReceived({
                citations: payload.citations,
                answerId: answerId!,
              })
            );
          }
        },

        'genqa.endOfStreamType': (message, dispatch) => {
          const payload = parsePayload(message.payload);
          dispatch(
            followUpCompleted({
              cannotAnswer: !payload.answerGenerated,
              answerId: answerId!,
            })
          );
        },
        error: (message, dispatch) => {
          if (message.finishReason === 'ERROR') {
            dispatch(
              followUpFailed({
                answerId: answerId!,
                message: message.errorMessage,
                code: message.code,
              })
            );
          }
        },
      },
    };
  };

function parsePayload(payload?: string): StreamPayload {
  if (!payload?.length) {
    return {};
  }

  try {
    return JSON.parse(payload) as StreamPayload;
  } catch (err) {
    console.warn('Failed to parse stream payload', {
      payload,
      error: err,
    });
    return {};
  }
}
