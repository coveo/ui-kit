import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {StreamPayload} from '../../api/knowledge/answer-generation/shared-types.js';
import type {StreamingStrategy} from '../../api/knowledge/answer-generation/streaming/strategies/strategy-types.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from '../generated-answer/generated-answer-analytics-actions.js';
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
          const payload: StreamPayload = message.payload.length
            ? JSON.parse(message.payload)
            : {};
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
          const payload: StreamPayload = message.payload.length
            ? JSON.parse(message.payload)
            : {};
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
          const payload: StreamPayload = message.payload.length
            ? JSON.parse(message.payload)
            : {};
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
          const payload: StreamPayload = message.payload.length
            ? JSON.parse(message.payload)
            : {};
          dispatch(
            followUpCompleted({
              cannotAnswer: !payload.answerGenerated,
              answerId: answerId!,
            })
          );
          dispatch(
            logGeneratedAnswerStreamEnd(payload.answerGenerated ?? false)
          );
          dispatch(logGeneratedAnswerResponseLinked());
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

// export const followUpAnswerStrategy: StreamingStrategy<AnswerGenerationApiState> =
//   {
//     handleOpen: (_response, dispatch) => {
//       const answerId = 'test';
//       // const answerId = response.headers.get('x-answer-id');
//       if (answerId) {
//         dispatch(setActiveFollowUpAnswerId(answerId));
//         dispatch(setFollowUpIsLoading({answerId, isLoading: true}));
//       }
//     },

//     handleError: (error) => {
//       throw error;
//     },

//     handleMessage: {
//       'genqa.headerMessageType': (message, dispatch) => {
//         const payload: StreamPayload = message.payload.length
//           ? JSON.parse(message.payload)
//           : {};
//         if (payload.contentFormat) {
//           dispatch(
//             setFollowUpAnswerContentFormat({
//               contentFormat: payload.contentFormat,
//               answerId: 'test',
//             })
//           );
//         }
//       },

//       'genqa.messageType': (message, dispatch) => {
//         const payload: StreamPayload = message.payload.length
//           ? JSON.parse(message.payload)
//           : {};
//         if (payload.textDelta) {
//           dispatch(
//             followUpMessageChunkReceived({
//               textDelta: payload.textDelta,
//               answerId: 'test',
//             })
//           );
//         }
//       },

//       'genqa.citationsType': (message, dispatch) => {
//         const payload: StreamPayload = message.payload.length
//           ? JSON.parse(message.payload)
//           : {};
//         if (payload.citations) {
//           dispatch(
//             followUpCitationsReceived({
//               citations: payload.citations,
//               answerId: 'test',
//             })
//           );
//         }
//       },

//       'genqa.endOfStreamType': (message, dispatch) => {
//         const payload: StreamPayload = message.payload.length
//           ? JSON.parse(message.payload)
//           : {};
//         dispatch(
//           followUpCompleted({
//             answerId: 'test',
//             cannotAnswer: !payload.answerGenerated,
//           })
//         );
//         dispatch(logGeneratedAnswerStreamEnd(payload.answerGenerated ?? false));
//         dispatch(logGeneratedAnswerResponseLinked());
//       },
//       error: (message, dispatch) => {
//         if (message.finishReason === 'ERROR') {
//           dispatch(
//             followUpFailed({
//               answerId: 'test',
//               message: message.errorMessage,
//               code: message.code,
//             })
//           );
//         }
//       },
//     },
//   };
