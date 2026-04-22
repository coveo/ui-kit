import type {AgentChatState} from './agent-chat-state.js';

interface StateWithAgentChat {
  agentChat?: AgentChatState;
}

export const selectAgentChatMessages = (state: StateWithAgentChat) =>
  state.agentChat?.conversation.messages ?? [];

export const selectAgentChatThreadId = (state: StateWithAgentChat) =>
  state.agentChat?.conversation.threadId ?? '';

export const selectAgentChatIsStreaming = (state: StateWithAgentChat) =>
  state.agentChat?.streaming.isActive ?? false;

export const selectAgentChatStreamingProgress = (state: StateWithAgentChat) =>
  state.agentChat?.streaming.progress ?? {steps: [], trace: []};

export const selectAgentChatCurrentMessageId = (state: StateWithAgentChat) =>
  state.agentChat?.streaming.currentMessageId ?? null;

export const selectAgentChatError = (state: StateWithAgentChat) =>
  state.agentChat?.error ?? null;

export const selectAgentChatThreadState = (state: StateWithAgentChat) =>
  state.agentChat?.threadState ?? {};
