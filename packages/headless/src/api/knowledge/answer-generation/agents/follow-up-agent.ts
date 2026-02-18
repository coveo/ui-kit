import {
  type AgentSubscriber,
  HttpAgent,
  type RunAgentInput,
} from '@ag-ui/client';
import type {Dispatch} from '@reduxjs/toolkit';
import {
  followUpCitationsReceived,
  followUpCompleted,
  followUpMessageChunkReceived,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
} from '../../../../features/follow-up-answers/follow-up-answers-actions.js';

/**
 * Custom HTTP Agent for follow-up answer requests
 */
export class FollowUpHttpAgent extends HttpAgent {
  protected requestInit(input: RunAgentInput): RequestInit {
    const {q, conversationId, accessToken} = input.forwardedProps || {};

    return {
      method: 'POST',
      headers: {
        ...this.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        q,
        conversationId,
      }),
      signal: this.abortController.signal,
    };
  }
}

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
    onTextMessageStartEvent: (param) => {
      console.log('Follow-up Subscriber - Text Message Start', param);
    },
    onTextMessageContentEvent: (param) => {
      console.log('Follow-up Subscriber - Text Message Content', param);
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
      console.log('Follow-up Subscriber - Run Error', param);
      dispatch(setFollowUpIsLoading({answerId: runId, isLoading: false}));
    },
    onRunFinishedEvent: (param) => {
      console.log('Follow-up Subscriber - Run Finished', param);
      dispatch(
        followUpCompleted({
          cannotAnswer: false,
          answerId: runId,
        })
      );
    },
  };
};

export const createFollowUpAgent = (organizationId: string, agentId: string) =>
  new FollowUpHttpAgent({
    url: `http://localhost:3000/orgs/${organizationId}/agents/${agentId}/follow-up`,
  });
