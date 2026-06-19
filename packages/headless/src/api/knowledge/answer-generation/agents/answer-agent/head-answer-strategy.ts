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
  GenerationToolCallArgsGeneric,
  GenerationToolCallArgsSearch,
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
    onStepStartedEvent: ({event, agent}) => {
      if (agent.isRunning === false) {
        return;
      }
      dispatch(
        startStep({
          name: event.stepName as GenerationStepName,
          startedAt: event.timestamp ?? Date.now(),
        })
      );
    },
    onStepFinishedEvent: ({event, agent}) => {
      if (agent.isRunning === false) {
        return;
      }
      dispatch(
        finishStep({
          name: event.stepName as GenerationStepName,
          finishedAt: event.timestamp ?? Date.now(),
        })
      );
    },
    onToolCallStartEvent: ({event, agent}) => {
      if (agent.isRunning === false) {
        return;
      }
      const {toolCallName, toolCallId, timestamp} = event;
      dispatch(
        startToolCall({
          toolCallId,
          toolCallName,
          startedAt: timestamp ?? Date.now(),
        })
      );
    },
    onToolCallEndEvent: ({event, agent}) => {
      if (agent.isRunning === false) {
        return;
      }
      const {toolCallId, timestamp} = event;
      dispatch(
        finishToolCall({
          toolCallId,
          finishedAt: timestamp ?? Date.now(),
        })
      );
    },
    onToolCallArgsEvent: ({event, agent}) => {
      if (agent.isRunning === false) {
        return;
      }
      const {toolCallId, delta} = event;
      try {
        // In AG-UI protocol, a tool call can stream a delta (a partial object) of tool call args, but we're enforcing
        // in the back-end that the delta is a complete JSON object representing the tool call args for simplicity and ease of use in the UI.
        const parsedArgs = JSON.parse(delta);
        if (typeof parsedArgs?.q === 'string') {
          dispatch(
            toolCallArgs({
              toolCallId,
              args: parsedArgs as GenerationToolCallArgsSearch,
              type: 'search',
            })
          );
        } else {
          dispatch(
            toolCallArgs({
              toolCallId,
              args: {raw: delta} as GenerationToolCallArgsGeneric,
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
    onTextMessageContentEvent: ({event, agent}) => {
      if (agent.isRunning === false) {
        return;
      }
      if (event.delta.length > 0) {
        answerHasText = true;
      }
      dispatch(updateMessage({textDelta: event.delta}));
    },
    onCustomEvent: ({event, agent}) => {
      if (agent.isRunning === false) {
        return;
      }
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
    onRunErrorEvent: ({event, agent}) => {
      if (agent.isRunning === false) {
        return;
      }
      const mappedCode = mapRunErrorCode(event.code);
      dispatch(
        updateError({
          message: event.message,
          code: mappedCode,
        })
      );
    },
    onRunFinishedEvent: ({event, agent}) => {
      if (agent.isRunning === false) {
        return;
      }
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
