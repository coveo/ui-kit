import {
  type AgentSubscriber,
  HttpAgent,
  type RunAgentInput,
} from '@ag-ui/client';
import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  followUpCompleted,
  followUpMessageChunkReceived,
  setActiveFollowUpAnswerId,
  setFollowUpAnswerContentFormat,
  setFollowUpIsLoading,
} from '../../../../features/follow-up-answers/follow-up-answers-actions.js';
import type {FollowUpAgentConfig, RunFollowUpInput} from './types.js';

/**
 * Custom HTTP Agent for follow-up answer requests
 */
class FollowUpHttpAgent extends HttpAgent {
  protected requestInit(input: RunAgentInput): RequestInit {
    const {q, conversationId} = input.forwardedProps || {};

    return {
      method: 'POST',
      headers: {
        ...this.headers,
        Authorization: `Bearer 123`,
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
const createFollowUpSubscriber = (engine: SearchEngine): AgentSubscriber => {
  let runId: string;

  return {
    onRunStartedEvent: ({event}) => {
      console.log('Follow-up Subscriber - Run Started', event);
      runId = event.runId;
      engine.dispatch(setActiveFollowUpAnswerId(runId));
      engine.dispatch(setFollowUpIsLoading({answerId: runId, isLoading: true}));
      engine.dispatch(
        setFollowUpAnswerContentFormat({
          contentFormat: 'text/markdown',
          answerId: runId,
        })
      );
    },
    onTextMessageStartEvent: (param) => {
      console.log('Follow-up Subscriber - Text Message Start', param);
    },
    onTextMessageContentEvent: (param) => {
      console.log('Follow-up Subscriber - Text Message Content', param);
      engine.dispatch(
        followUpMessageChunkReceived({
          textDelta: param.event.delta,
          answerId: runId,
        })
      );
    },
    onCustomEvent: (param) => {
      console.log('Follow-up Subscriber - Custom Event', param);
    },
    onRunErrorEvent: (param) => {
      console.log('Follow-up Subscriber - Run Error', param);
      engine.dispatch(
        setFollowUpIsLoading({answerId: runId, isLoading: false})
      );
    },
    onRunFinishedEvent: (param) => {
      console.log('Follow-up Subscriber - Run Finished', param);
      engine.dispatch(
        followUpCompleted({
          cannotAnswer: false,
          answerId: runId,
        })
      );
    },
  };
};

/**
 * Creates and configures a follow-up answer agent
 */
export function createFollowUpAgent(
  engine: SearchEngine,
  config: FollowUpAgentConfig
): FollowUpHttpAgent {
  const agent = new FollowUpHttpAgent({
    url: config.url,
    agentId: config.agentId,
    threadId: config.threadId,
  });

  const subscriber = createFollowUpSubscriber(engine);
  agent.subscribe(subscriber);

  return agent;
}

/**
 * Helper to run a follow-up query
 */
export function runFollowUpQuery(
  agent: FollowUpHttpAgent,
  input: RunFollowUpInput
): void {
  agent.runAgent({
    forwardedProps: {
      q: input.question,
      conversationId: input.conversationId,
    },
  });
}
