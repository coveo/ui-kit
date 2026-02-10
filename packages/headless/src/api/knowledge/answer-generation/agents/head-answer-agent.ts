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
import type {AnswerGenerationApiState} from '../answer-generation-api-state.js';

/**
 * Custom HTTP Agent for head answer requests
 */
export class HeadAnswerHttpAgent extends HttpAgent {
  protected requestInit(input: RunAgentInput): RequestInit {
    const {
      question,
      state: {configuration: accessToken},
    } = input.forwardedProps || {};

    return {
      method: 'POST',
      headers: {
        ...this.headers,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        q: question,
      }),
      signal: this.abortController.signal,
    };
  }
}

/**
 * Creates an AgentSubscriber that handles head answer streaming events
 */
const createHeadAnswerSubscriber = (
  dispatch: ThunkDispatch<{}, unknown, UnknownAction>
): AgentSubscriber => {
  // let runId: string;
  return {
    onRunStartedEvent: ({event}) => {
      console.log('Head Answer Subscriber - Run Started', event);
      // runId = event.runId;
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
      // Handle error
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

/**
 * Creates and configures a head answer agent
 */
export function createHeadAnswerAgent(): HeadAnswerHttpAgent {
  const agent = new HeadAnswerHttpAgent({
    url: 'http://localhost:3000/answer',
  });

  return agent;
}

interface RunHeadAnswerInput {
  question: string;
}

/**
 * Helper to run a head answer query
 */
export async function runHeadAnswerAgent(
  agent: HeadAnswerHttpAgent,
  input: RunHeadAnswerInput,
  state: AnswerGenerationApiState,
  dispatch: ThunkDispatch<{}, unknown, UnknownAction>
): Promise<void> {
  const subscriber = createHeadAnswerSubscriber(dispatch);
  agent.subscribe(subscriber);
  await agent.runAgent({
    forwardedProps: {
      question: input.question,
      state,
    },
  });
}
