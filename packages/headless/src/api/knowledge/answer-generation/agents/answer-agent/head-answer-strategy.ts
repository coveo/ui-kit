import type {Dispatch} from '@reduxjs/toolkit';
import {
  setFollowUpAnswersConversationId,
  setIsEnabled,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
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
} from '../../../../../features/generated-answer/generated-answer-actions.js';
import type {AgentSubscriber} from '../sse-agent/index.js';

/**
 * Creates an AgentSubscriber that handles answer streaming events
 */
export const createHeadAnswerStrategy = (
  dispatch: Dispatch
): AgentSubscriber => {
  return {
    onRunStartedEvent: (param) => {
      dispatch(setAnswerId(param.event.runId));
      dispatch(setIsLoading(true));
    },
    onTextMessageStartEvent: () => {
      dispatch(setIsStreaming(true));
    },
    onTextMessageContentEvent: (param) => {
      dispatch(updateMessage({textDelta: param.event.delta}));
    },
    onCustomEvent: (param) => {
      const {
        event: {name, value},
      } = param;
      switch (name) {
        case 'header': {
          if (value?.conversationId) {
            dispatch(setFollowUpAnswersConversationId(value.conversationId));
          }
          if (value?.contentFormat) {
            dispatch(setAnswerContentFormat(value.contentFormat));
          }
          if (value?.followUpEnabled) {
            dispatch(setIsEnabled(value.followUpEnabled));
          }
          break;
        }
        case 'citations': {
          dispatch(updateCitations({citations: value.citations}));
          break;
        }
      }
    },
    onRunErrorEvent: (param) => {
      const code = param.event.code;
      dispatch(
        updateError({
          message: param.event.message,
          code: code ? Number(code) : undefined,
        })
      );
    },
    onRunFinishedEvent: (param) => {
      const answerGenerated = param.event.result?.answerGenerated ?? false;
      dispatch(setIsAnswerGenerated(answerGenerated));
      dispatch(setCannotAnswer(!answerGenerated));
      dispatch(setIsStreaming(false));
      dispatch(setIsLoading(false));
    },
  };
};
