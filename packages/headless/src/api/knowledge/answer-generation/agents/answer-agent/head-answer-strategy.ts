import type {AgentSubscriber} from '@ag-ui/client';
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

/**
 * Creates an AgentSubscriber that handles answer streaming events
 */
export const createHeadAnswerStrategy = (
  dispatch: Dispatch
): AgentSubscriber => {
  return {
    onRunStartedEvent: ({event}) => {
      dispatch(setAnswerId(event.runId));
      dispatch(setIsLoading(false));
      dispatch(setIsStreaming(true));
      dispatch(setFollowUpAnswersConversationId(event.threadId));
    },
    onTextMessageContentEvent: ({event}) => {
      dispatch(updateMessage({textDelta: event.delta}));
    },
    onCustomEvent: ({event}) => {
      const {name, value} = event;
      switch (name) {
        case 'header': {
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
    onRunErrorEvent: ({event}) => {
      const code = event.code;
      dispatch(
        updateError({
          message: event.message,
          code: code ? Number(code) : undefined,
        })
      );
    },
    onRunFinishedEvent: ({event}) => {
      const answerGenerated = event.result?.answerGenerated ?? false;
      dispatch(setIsAnswerGenerated(answerGenerated));
      dispatch(setCannotAnswer(!answerGenerated));
      dispatch(setIsStreaming(false));
      dispatch(setIsLoading(false));
    },
  };
};
