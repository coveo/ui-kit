import type {AgentSubscriber} from '@ag-ui/client';
import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {
  setFollowUpAnswersConversationId,
  setFollowUpAnswersConversationToken,
  setIsEnabled,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
import {
  finishStep,
  setAnswerContentFormat,
  setAnswerId,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  startStep,
  updateCitations,
  updateError,
  updateMessage,
} from '../../../../../features/generated-answer/generated-answer-actions.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from '../../../../../features/generated-answer/generated-answer-analytics-actions.js';
import type {GenerationStepName} from '../../../../../features/generated-answer/generated-answer-state.js';
import {mapRunErrorCode} from '../../../../../features/generated-answer/sse-generated-answer-errors.js';

/**
 * Creates an AgentSubscriber that handles answer streaming events
 */
export const createHeadAnswerStrategy = (
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>
): AgentSubscriber => {
  return {
    onRunStartedEvent: ({event}) => {
      dispatch(setAnswerId(event.runId));
      dispatch(setIsLoading(false));
      dispatch(setIsStreaming(true));
      dispatch(setFollowUpAnswersConversationId(event.threadId));
    },
    onStepStartedEvent: ({event}) => {
      dispatch(
        startStep({
          name: event.stepName as GenerationStepName,
          startedAt: event.timestamp ?? Date.now(),
        })
      );
    },
    onStepFinishedEvent: ({event}) => {
      dispatch(
        finishStep({
          name: event.stepName as GenerationStepName,
          finishedAt: event.timestamp ?? Date.now(),
        })
      );
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
          if (value?.conversationToken) {
            dispatch(
              setFollowUpAnswersConversationToken(value.conversationToken)
            );
          }
          return;
        }
        case 'citations': {
          dispatch(updateCitations({citations: value.citations}));
          return;
        }
      }
    },
    onRunErrorEvent: ({event}) => {
      const mappedCode = mapRunErrorCode(event.code);
      dispatch(
        updateError({
          message: event.message,
          code: mappedCode,
        })
      );
    },
    onRunFinishedEvent: ({event}) => {
      const answerGenerated = event.result?.completionReason === 'ANSWERED';
      dispatch(setIsAnswerGenerated(answerGenerated));
      dispatch(setCannotAnswer(!answerGenerated));
      dispatch(setIsStreaming(false));
      dispatch(logGeneratedAnswerStreamEnd(answerGenerated));
      dispatch(logGeneratedAnswerResponseLinked());
    },
  };
};
