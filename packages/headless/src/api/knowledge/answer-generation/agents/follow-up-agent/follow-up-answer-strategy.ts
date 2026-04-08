import type {AgentSubscriber} from '@ag-ui/client';
import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import {
  activeFollowUpStartFailed,
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  followUpStepFinished,
  followUpStepStarted,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
  setFollowUpIsStreaming,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
import {
  logGeneratedAnswerResponseLinked,
  logGeneratedAnswerStreamEnd,
} from '../../../../../features/generated-answer/generated-answer-analytics-actions.js';
import type {GenerationStepName} from '../../../../../features/generated-answer/generated-answer-state.js';
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
    onRunErrorEvent: ({event}) => {
      const mappedCode = mapRunErrorCode(event.code);
      const targetAnswerId = runId || (event as {runId?: string}).runId;
      if (targetAnswerId) {
        dispatch(
          followUpFailed({
            message: event.message,
            code: mappedCode,
            answerId: targetAnswerId,
          })
        );
      } else {
        // If runId is not set, it means the error occurred before the run started or the runId was not provided. In this case, we dispatch a generic failure action without an answerId.
        dispatch(
          activeFollowUpStartFailed({
            message: event.message,
            code: mappedCode,
          })
        );
      }
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
        logGeneratedAnswerStreamEnd(
          answerGenerated,
          runId,
          answerTextIsEmpty,
          event.threadId
        )
      );
      dispatch(logGeneratedAnswerResponseLinked(runId));
      runId = '';
      answerHasText = false;
    },
  };
};
