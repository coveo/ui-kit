import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {
  // StreamingStrategy,
  StreamingStrategy,
  // StreamPayload,
} from '../../api/knowledge/answer-generation/streaming/types.js';
import {
  followUpCitationsReceived,
  followUpCompleted,
  // followUpFailed,
  followUpMessageChunkReceived,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
} from './follow-up-answers-actions.js';

export const createFollowUpAnswerStrategy =
  (): StreamingStrategy<AnswerGenerationApiState> => {
    let answerId: string | null = null;

    return {
      handleOpen: (_response, dispatch) => {
        answerId = Math.random().toString(36).substring(2, 15);
        if (answerId) {
          dispatch(setActiveFollowUpAnswerId(answerId));
          dispatch(setFollowUpIsLoading({answerId, isLoading: true}));
          dispatch(
            setFollowUpAnswerContentFormat({
              contentFormat: 'text/markdown',
              answerId: answerId!,
            })
          );
        }
      },

      handleError: (error) => {
        throw error;
      },

      handleMessage: {
        'agentInteraction.answerHeader': (_message, dispatch) => {
          dispatch(
            setFollowUpAnswerContentFormat({
              contentFormat: 'text/markdown',
              answerId: answerId!,
            })
          );
        },

        'generativeengines.headerMessageType': (_message, dispatch) => {
          dispatch(
            setFollowUpAnswerContentFormat({
              contentFormat: 'text/markdown',
              answerId: answerId!,
            })
          );
        },

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
      },
    };
  };
