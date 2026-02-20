import type {Dispatch} from '@reduxjs/toolkit';
import {
  followUpCitationsReceived,
  followUpCompleted,
  followUpFailed,
  followUpMessageChunkReceived,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
} from '../../../../../features/follow-up-answers/follow-up-answers-actions.js';
import type {AgentSubscriber} from '../sse-agent/index.js';

/**
 * Creates an AgentSubscriber that handles follow-up answer streaming events
 */
export const createFollowUpStrategy = (dispatch: Dispatch): AgentSubscriber => {
  let runId: string;

  return {
    onRunStartedEvent: ({event}) => {
      runId = event.runId;
      dispatch(setActiveFollowUpAnswerId(runId));
      dispatch(setFollowUpIsLoading({answerId: runId, isLoading: true}));
    },
    onTextMessageContentEvent: (param) => {
      dispatch(
        followUpMessageChunkReceived({
          textDelta: param.event.delta,
          answerId: runId,
        })
      );
    },
    onCustomEvent: (param) => {
      const {
        event: {name, value},
      } = param;
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
    onRunErrorEvent: (param) => {
      const code = param.event.code;
      dispatch(
        followUpFailed({
          message: param.event.message,
          code: code ? Number(code) : undefined,
          answerId: runId,
        })
      );
    },
    onRunFinishedEvent: (param) => {
      const answerGenerated = param.event.result?.answerGenerated ?? false;
      dispatch(
        followUpCompleted({
          cannotAnswer: !answerGenerated,
          answerId: runId,
        })
      );
    },
  };
};
