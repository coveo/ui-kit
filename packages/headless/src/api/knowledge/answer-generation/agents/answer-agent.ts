import {
  type AgentSubscriber,
  HttpAgent,
  type RunAgentInput,
} from '@ag-ui/client';
import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit/react';
import {setFollowUpAnswersConversationId} from '../../../../features/follow-up-answers/follow-up-answers-actions.js';
import {
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  updateMessage,
} from '../../../../features/generated-answer/generated-answer-actions.js';

/**
 * Custom HTTP Agent for answer requests
 */
export class AnswerHttpAgent extends HttpAgent {
  protected requestInit(input: RunAgentInput): RequestInit {
    const {params, accessToken} = input.forwardedProps || {};
    return {
      method: 'POST',
      headers: {
        ...this.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(params),
      signal: this.abortController.signal,
    };
  }
}

/**
 * Creates an AgentSubscriber that handles answer streaming events
 */
export const createHeadAnswerStrategy = (
  dispatch: ThunkDispatch<{}, unknown, UnknownAction>
): AgentSubscriber => {
  return {
    onRunStartedEvent: ({event}) => {
      console.log('Head Answer Subscriber - Run Started', event);
      dispatch(setIsLoading(true));
      dispatch(setFollowUpAnswersConversationId(event.threadId));
    },
    onTextMessageStartEvent: (param) => {
      console.log('Head Answer Subscriber - Text Message Start', param);
      dispatch(setIsStreaming(true));
    },
    onTextMessageContentEvent: (param) => {
      console.log('Head Answer Subscriber - Text Message Content', param);
      dispatch(updateMessage({textDelta: param.event.delta}));
    },
    onCustomEvent: (param) => {
      console.log('Head Answer Subscriber - Custom Event', param);
    },
    onRunErrorEvent: (param) => {
      console.log('Head Answer Subscriber - Run Error', param);
    },
    onRunFinishedEvent: (param) => {
      console.log('Head Answer Subscriber - Run Finished', param);
      dispatch(setIsAnswerGenerated(true));
      dispatch(setCannotAnswer(false));
      dispatch(setIsStreaming(false));
      dispatch(setIsLoading(false));
    },
  };
};

export const createAnswerAgent = (organizationId: string, agentId: string) =>
  new AnswerHttpAgent({
    url: `http://localhost:3000/orgs/${organizationId}/agents/${agentId}/answer`,
  });
