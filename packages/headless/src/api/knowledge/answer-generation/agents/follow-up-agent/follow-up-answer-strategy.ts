import type {AgentSubscriber} from '@ag-ui/client';
import type {Dispatch} from '@reduxjs/toolkit';
import {
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
  setFollowUpIsStreaming,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';

/**
 * Creates an AgentSubscriber that handles follow-up answer streaming events
 */
export const createFollowUpStrategy = (dispatch: Dispatch): AgentSubscriber => {
  let runId: string;

  return {
    onRunStartedEvent: ({event}) => {
      runId = event.runId;
      dispatch(setActiveFollowUpAnswerId(runId));
      dispatch(setFollowUpIsLoading({answerId: runId, isLoading: false}));
      dispatch(setFollowUpIsStreaming({answerId: runId, isStreaming: true}));
    },
    onTextMessageContentEvent: ({event}) => {
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
          break;
        }
        case 'citations': {
          dispatch(
            followUpCitationsReceived({
              citations: value.citations,
              answerId: runId,
            })
          );
          break;
        }
      }
    },
    onRunErrorEvent: ({event}) => {
      const code = event.code;
      dispatch(
        followUpFailed({
          message: event.message,
          code: code ? Number(code) : undefined,
          answerId: runId,
        })
      );
      runId = '';
    },
    onRunFinishedEvent: ({event}) => {
      const answerGenerated = event.result?.answerGenerated ?? false;
      dispatch(
        followUpCompleted({
          cannotAnswer: !answerGenerated,
          answerId: runId,
        })
      );
      runId = '';
    },
  };
};
