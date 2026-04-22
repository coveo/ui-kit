import type {ThunkDispatch, UnknownAction} from '@reduxjs/toolkit';
import type {AgentChatMessage} from '../../../features/commerce/agent-chat/agent-chat-state.js';
import {
  beginChatTurn,
  setAgentChatError,
  setStreamingActive,
} from '../../../features/commerce/agent-chat/agent-chat-actions.js';
import {buildInvocationMessages} from '../../../features/commerce/agent-chat/utils/context-builder.js';
import {
  CommerceAgent,
  resolveAgentUrl,
  type CommerceAgentOptions,
} from './commerce-agent.js';
import {createCommerceAgentStrategy} from './commerce-agent-strategy.js';

/**
 * Creates a runner that manages the lifecycle of commerce agent invocations.
 * Ensures only one agent runs at a time — starting a new run aborts the previous one.
 *
 * Follows the same pattern as `createAnswerRunner` from the generated answer feature.
 */
export const createCommerceAgentRunner = (options: CommerceAgentOptions) => {
  let currentAgent: CommerceAgent | undefined;

  const resolvedUrl = resolveAgentUrl(
    options.organizationId ?? '',
    options.environment
  );

  const abortRun = () => {
    currentAgent?.abortRun();
    currentAgent = undefined;
  };

  const run = async (
    dispatch: ThunkDispatch<unknown, unknown, UnknownAction>,
    content: string,
    messages: AgentChatMessage[],
    threadId: string,
    threadState: Record<string, unknown>
  ) => {
    abortRun();

    const userMessage: AgentChatMessage = {
      id: generateId('msg-user'),
      role: 'user',
      content,
      activities: [],
      progress: null,
    };

    const assistantMessage: AgentChatMessage = {
      id: generateId('msg-assistant'),
      role: 'assistant',
      content: '',
      activities: [],
      progress: null,
    };

    dispatch(beginChatTurn({userMessage, assistantMessage}));

    const historyForAgent = buildInvocationMessages(messages);

    const agent = new CommerceAgent(resolvedUrl, options);
    agent.threadId = threadId;
    agent.setMessages([...historyForAgent, userMessage] as Parameters<
      typeof agent.setMessages
    >[0]);
    if (threadState) {
      agent.state = threadState as typeof agent.state;
    }
    currentAgent = agent;

    const strategy = createCommerceAgentStrategy(dispatch, assistantMessage.id);

    try {
      await agent.runAgent(
        {
          runId: generateId('run'),
          tools: [],
          context: [],
          forwardedProps: {},
        },
        strategy
      );
    } catch (error) {
      dispatch(setStreamingActive(false));
      dispatch(
        setAgentChatError({
          message:
            error instanceof Error
              ? error.message
              : 'An error occurred while communicating with the agent.',
        })
      );
    }
  };

  return {
    run,
    abortRun,
  };
};

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
