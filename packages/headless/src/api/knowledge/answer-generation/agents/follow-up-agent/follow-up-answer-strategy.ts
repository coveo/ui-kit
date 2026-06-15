import type {AgentSubscriber} from '@ag-ui/client';
import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  followUpStepFinished,
  followUpStepStarted,
  followUpToolCallFinished,
  followUpToolCallStarted,
  followUpToolCallArgs,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
  setFollowUpIsStreaming,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
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
 * Creates an AgentSubscriber that handles follow-up answer streaming events
 */
export const createFollowUpStrategy = (
  dispatch: ThunkDispatch<unknown, unknown, UnknownAction>
): AgentSubscriber => {
  let runId = '';
  let answerHasText = false;

  return {
    onRunStartedEvent: ({event}) => {
      runId = event.runId;
      answerHasText = false;
      dispatch(setActiveFollowUpAnswerId(runId));
      dispatch(setFollowUpIsLoading({answerId: runId, isLoading: false}));
      dispatch(setFollowUpIsStreaming({answerId: runId, isStreaming: true}));
    },
    onStepStartedEvent: ({event}) => {
      dispatch(
        followUpStepStarted({
          name: event.stepName as GenerationStepName,
          startedAt: event.timestamp ?? Date.now(),
          answerId: runId,
        })
      );
    },
    onStepFinishedEvent: ({event}) => {
      dispatch(
        followUpStepFinished({
          name: event.stepName as GenerationStepName,
          finishedAt: event.timestamp ?? Date.now(),
          answerId: runId,
        })
      );
    },
    onToolCallStartEvent: ({event}) => {
      const {toolCallName, toolCallId, timestamp} = event;
      dispatch(
        followUpToolCallStarted({
          answerId: runId,
          toolCallId,
          toolCallName,
          startedAt: timestamp ?? Date.now(),
        })
      );
    },
    onToolCallEndEvent: ({event}) => {
      const {toolCallId, timestamp} = event;
      dispatch(
        followUpToolCallFinished({
          answerId: runId,
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
        const args: ToolCallArgsSearch | ToolCallArgsGeneric =
          typeof parsedArgs?.q === 'string' ? parsedArgs : {raw: delta};
        dispatch(followUpToolCallArgs({answerId: runId, toolCallId, args}));
      } catch {
        dispatch(
          followUpToolCallArgs({
            answerId: runId,
            toolCallId,
            args: {raw: delta},
          })
        );
      }
    },
    onTextMessageContentEvent: ({event}) => {
      if (event.delta.length > 0) {
        answerHasText = true;
      }
      dispatch(
        followUpMessageChunkReceived({
          textDelta: event.delta,
          answerId: runId,
        })
      );
    },
    onCustomEvent: ({event}) => {
      const {name, value} = event;
      switch (name) {
        case 'header': {
          if (value?.contentFormat) {
            dispatch(
              setFollowUpAnswerContentFormat({
                contentFormat: value.contentFormat,
                answerId: runId,
              })
            );
          }
          return;
        }
        case 'citations': {
          dispatch(
            followUpCitationsReceived({
              citations: value.citations,
              answerId: runId,
            })
          );
          return;
        }
      }
    },
    onRunErrorEvent: ({input, event}) => {
      if (!runId) {
        runId = input.runId;
        dispatch(setActiveFollowUpAnswerId(input.runId));
      }

      const mappedCode = mapRunErrorCode(event.code);

      dispatch(
        followUpFailed({
          message: event.message,
          code: mappedCode,
          answerId: runId,
        })
      );
      runId = '';
    },
    onRunFinishedEvent: ({event}) => {
      const answerGenerated = event.result?.completionReason === 'ANSWERED';
      const answerTextIsEmpty = answerGenerated ? !answerHasText : undefined;
      dispatch(
        followUpCompleted({
          cannotAnswer: !answerGenerated,
          answerId: runId,
        })
      );
      dispatch(
        logGeneratedAnswerStreamEnd(answerGenerated, runId, answerTextIsEmpty)
      );
      dispatch(logGeneratedAnswerResponseLinked(runId));
      runId = '';
      answerHasText = false;
    },
  };
};
