import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {
  // StreamingStrategy,
  StreamingStrategyAlpha,
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
  (): StreamingStrategyAlpha<AnswerGenerationApiState> => {
    let answerId: string | null = null;

    return {
      handleOpen: (response, dispatch) => {
        answerId = Math.random().toString(36).substring(2, 15);
        console.log(response.headers);
        console.log('Follow-up answerId from headers:', answerId);
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
          console.log('dispatched agentInteraction.answerHeader for follow-up');
          dispatch(
            setFollowUpAnswerContentFormat({
              contentFormat: 'text/markdown',
              answerId: answerId!,
            })
          );
        },

        'generativeengines.headerMessageType': (_message, dispatch) => {
          console.log(
            'dispatched generativeengines.headerMessageType for follow-up'
          );
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

        // 'genqa.headerMessageType': (message, dispatch) => {
        //   const payload = parsePayload(message.payload);
        //   if (payload.contentFormat) {
        //     dispatch(
        //       setFollowUpAnswerContentFormat({
        //         contentFormat: payload.contentFormat,
        //         answerId: answerId!,
        //       })
        //     );
        //   }
        // },

        // 'genqa.messageType': (message, dispatch) => {
        //   const payload = parsePayload(message.payload);
        //   if (payload.textDelta) {
        //     dispatch(
        //       followUpMessageChunkReceived({
        //         textDelta: payload.textDelta,
        //         answerId: answerId!,
        //       })
        //     );
        //   }
        // },

        // 'genqa.citationsType': (message, dispatch) => {
        //   const payload = parsePayload(message.payload);
        //   if (payload.citations !== undefined) {
        //     dispatch(
        //       followUpCitationsReceived({
        //         citations: payload.citations,
        //         answerId: answerId!,
        //       })
        //     );
        //   }
        // },

        // 'genqa.endOfStreamType': (message, dispatch) => {
        //   const payload = parsePayload(message.payload);
        //   dispatch(
        //     followUpCompleted({
        //       cannotAnswer: !payload.answerGenerated,
        //       answerId: answerId!,
        //     })
        //   );
        // },
        // error: (message, dispatch) => {
        //   if (message.finishReason === 'ERROR') {
        //     dispatch(
        //       followUpFailed({
        //         answerId: answerId!,
        //         message: message.errorMessage,
        //         code: message.code,
        //       })
        //     );
        //   }
        // },
      },
    };
  };

// function parsePayload(payload?: string): StreamPayload {
//   if (!payload?.length) {
//     return {};
//   }

//   try {
//     return JSON.parse(payload) as StreamPayload;
//   } catch (err) {
//     console.warn('Failed to parse stream payload', {
//       payload,
//       error: err,
//     });
//     return {};
//   }
// }
