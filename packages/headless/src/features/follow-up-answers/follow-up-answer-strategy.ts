import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {StreamingStrategy} from '../../api/knowledge/answer-generation/streaming/types.js';
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
          dispatch(
            setFollowUpAnswerContentFormat({
              contentFormat: 'text/markdown',
              answerId: answerId,
            })
          );
        }
      },

      handleError: (error) => {
        throw error;
      },

      handleMessage: {
        'generativeengines.messageType': (message, dispatch) => {
          if (message?.payload?.textDelta) {
            dispatch(
              followUpMessageChunkReceived({
                textDelta: message.payload.textDelta,
                answerId: answerId!,
              })
            );
          }
        },

        'agentInteraction.citations': (message, dispatch) => {
          if (message?.payload?.citations !== undefined) {
            dispatch(
              followUpCitationsReceived({
                citations: message.payload.citations,
                answerId: answerId!,
              })
            );
          }
        },

        'generativeengines.endOfStreamType': (message, dispatch) => {
          const answerGenerated = message?.payload?.answerGenerated ?? false;
          dispatch(
            followUpCompleted({
              cannotAnswer: !answerGenerated,
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
