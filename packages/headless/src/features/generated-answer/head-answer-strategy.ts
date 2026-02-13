import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import type {StreamingStrategy} from '../../api/knowledge/answer-generation/streaming/types.js';
import {
  setFollowUpAnswersConversationId,
  setIsEnabled,
} from '../follow-up-answers/follow-up-answers-actions.js';
import {
  setAnswerContentFormat,
  setAnswerId,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  updateCitations,
  updateMessage,
} from './generated-answer-actions.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from './generated-answer-analytics-actions.js';

export const createHeadAnswerStrategy =
  (): StreamingStrategy<AnswerGenerationApiState> => {
    return {
      handleOpen: (_response, dispatch) => {
        const answerId = Math.random().toString(36).substring(2, 15);
        if (answerId) {
          dispatch(setAnswerId(answerId));
        }
      },

      handleError: (error) => {
        throw error;
      },

      handleMessage: {
        'agentInteraction.answerHeader': (message, dispatch) => {
          console.log('message payload:', message?.payload?.conversationId);
          if (message?.payload?.conversationId) {
            dispatch(
              setFollowUpAnswersConversationId(message.payload.conversationId)
            );
          }
          if (message.payload.followUpEnabled) {
            dispatch(setIsEnabled(message.payload.followUpEnabled));
          }
          dispatch(setAnswerContentFormat('text/markdown'));
          dispatch(setIsStreaming(true));
          dispatch(setIsLoading(false));
        },

        'generativeengines.messageType': (message, dispatch) => {
          if (message?.payload?.textDelta) {
            dispatch(updateMessage({textDelta: message.payload.textDelta}));
          }
        },

        'agentInteraction.citations': (message, dispatch) => {
          if (message?.payload?.citations !== undefined) {
            dispatch(updateCitations({citations: message.payload.citations}));
          }
        },

        'generativeengines.endOfStreamType': (message, dispatch) => {
          const answerGenerated = message?.payload?.answerGenerated ?? false;

          dispatch(setIsAnswerGenerated(answerGenerated));
          dispatch(setCannotAnswer(!answerGenerated));
          dispatch(setIsStreaming(false));
          dispatch(setIsLoading(false));
          dispatch(logGeneratedAnswerStreamEnd(answerGenerated));
          dispatch(logGeneratedAnswerResponseLinked());
        },
      },
    };
  };
