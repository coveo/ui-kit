import type {AgentSubscriber} from '@ag-ui/client';
import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {
  clearFollowUpAnswersConversationToken,
  setFollowUpAnswersConversationId,
  setFollowUpAnswersConversationToken,
  setIsEnabled,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
import {
  finishStep,
  finishToolCall,
  setAnswerContentFormat,
  setAnswerId,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  startStep,
  startToolCall,
  toolCallArgs,
  updateCitations,
  updateError,
  updateMessage,
} from '../../../../../features/generated-answer/generated-answer-actions.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from '../../../../../features/generated-answer/generated-answer-analytics-actions.js';
import type {
  GenerationStepName,
  ToolCallArgsGeneric,
  ToolCallArgsSearch,
} from '../../../../../features/generated-answer/generated-answer-state.js';
import {mapRunErrorCode} from '../../../../../features/generated-answer/sse-generated-answer-errors.js';

/**
 * Creates an AgentSubscriber that handles answer streaming events
 */
export const createHeadAnswerStrategy = (
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>
): AgentSubscriber => {
  let runId = '';
  let answerHasText = false;

  return {
    onRunStartedEvent: ({event}) => {
      runId = event.runId;
      answerHasText = false;
      dispatch(setAnswerId(event.runId));
      dispatch(setIsLoading(false));
      dispatch(setIsStreaming(true));
      dispatch(setFollowUpAnswersConversationId(event.threadId));
      dispatch(clearFollowUpAnswersConversationToken());
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
    onToolCallStartEvent: ({event}) => {
      const {toolCallName, toolCallId, timestamp} = event;
      dispatch(
        startToolCall({
          toolCallId,
          toolCallName,
          startedAt: timestamp ?? Date.now(),
        })
      );
    },
    onToolCallEndEvent: ({event}) => {
      const {toolCallId, timestamp} = event;
      dispatch(
        finishToolCall({
          toolCallId,
          finishedAt: timestamp ?? Date.now(),
        })
      );
    },
    onToolCallArgsEvent: ({event}) => {
      const {toolCallId, delta} = event;
      try {
        // In AG-UI protocol, a tool call can stream a delta (a partial object) of tool call args, but we're enforcing that the delta
        // is a complete JSON object representing the tool call args for simplicity and ease of use in the UI.
        const parsedArgs = JSON.parse(delta);
        if (typeof parsedArgs?.q === 'string') {
          dispatch(
            toolCallArgs({
              toolCallId,
              args: parsedArgs as ToolCallArgsSearch,
              type: 'search',
            })
          );
        } else {
          dispatch(
            toolCallArgs({
              toolCallId,
              args: {raw: delta} as ToolCallArgsGeneric,
              type: 'generic',
            })
          );
        }
      } catch {
        console.warn(
          `Failed to parse tool call args delta as JSON. Using raw string instead. Delta: ${delta}`
        );
        dispatch(
          toolCallArgs({toolCallId, args: {raw: delta}, type: 'generic'})
        );
      }
    },
    onTextMessageContentEvent: ({event}) => {
      if (event.delta.length > 0) {
        answerHasText = true;
      }
      dispatch(updateMessage({textDelta: event.delta}));
    },
    onCustomEvent: ({event}) => {
      const {name, value} = event;
      switch (name) {
        case 'header': {
          if (value?.contentFormat) {
            dispatch(setAnswerContentFormat(value.contentFormat));
          }
          if (typeof value?.followUpEnabled === 'boolean') {
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
      const answerTextIsEmpty = answerGenerated ? !answerHasText : undefined;
      dispatch(setIsAnswerGenerated(answerGenerated));
      dispatch(setCannotAnswer(!answerGenerated));
      dispatch(setIsStreaming(false));
      dispatch(
        logGeneratedAnswerStreamEnd(answerGenerated, runId, answerTextIsEmpty)
      );
      dispatch(logGeneratedAnswerResponseLinked());
    },
  };
};
