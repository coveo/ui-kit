import {
  type AgentSubscriber,
  HttpAgent,
  type RunAgentInput,
} from '@ag-ui/client';
import type {Dispatch} from '@reduxjs/toolkit/react';
import {
  setFollowUpAnswersConversationId,
  setIsEnabled,
} from '../../../../features/follow-up-answers/follow-up-answers-actions.js';
import {
  setAnswerContentFormat,
  setCannotAnswer,
  setIsAnswerGenerated,
  setIsLoading,
  setIsStreaming,
  updateCitations,
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
  dispatch: Dispatch
): AgentSubscriber => {
  return {
    onRunStartedEvent: ({event}) => {
      dispatch(setFollowUpAnswersConversationId(event.threadId));
      dispatch(setIsLoading(true));
    },
    onTextMessageStartEvent: () => {
      dispatch(setIsStreaming(true));
    },
    onTextMessageContentEvent: (param) => {
      dispatch(updateMessage({textDelta: param.event.delta}));
    },
    onCustomEvent: (param) => {
      const {
        event: {name, value},
      } = param;
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
    onRunErrorEvent: (_param) => {},
    onRunFinishedEvent: (param) => {
      const answerGenerated = param.event.result?.answerGenerated ?? false;
      dispatch(setIsAnswerGenerated(answerGenerated));
      dispatch(setCannotAnswer(answerGenerated));
      dispatch(setIsStreaming(false));
      dispatch(setIsLoading(false));
    },
  };
};

export const createAnswerAgent = (organizationId: string, agentId: string) =>
  new AnswerHttpAgent({
    url: `http://localhost:3000/orgs/${organizationId}/agents/${agentId}/answer`,
  });
