export type AgentChatActivityOwnership = 'backend' | 'client';

export interface AgentChatActivity {
  id: string;
  type: string;
  data: Record<string, unknown>;
  ownership: AgentChatActivityOwnership;
}

export type AgentChatTraceEntryKind = 'reasoning' | 'tool';
export type AgentChatTraceEntryStatus = 'streaming' | 'completed';

export interface AgentChatTraceEntry {
  id: string;
  kind: AgentChatTraceEntryKind;
  label: string;
  text: string;
  status: AgentChatTraceEntryStatus;
}

export interface AgentChatProgress {
  steps: string[];
  trace: AgentChatTraceEntry[];
}

export interface AgentChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  activities: AgentChatActivity[];
  progress: AgentChatProgress | null;
}

export interface AgentChatError {
  message: string;
  code?: number;
}

export interface AgentChatStreamingState {
  isActive: boolean;
  currentMessageId: string | null;
  progress: AgentChatProgress;
}

export interface AgentChatConversation {
  threadId: string;
  messages: AgentChatMessage[];
}

export interface AgentChatState {
  conversation: AgentChatConversation;
  streaming: AgentChatStreamingState;
  threadState: Record<string, unknown>;
  error: AgentChatError | null;
}

export const getAgentChatInitialState = (threadId = ''): AgentChatState => ({
  conversation: {
    threadId,
    messages: [],
  },
  streaming: {
    isActive: false,
    currentMessageId: null,
    progress: {
      steps: [],
      trace: [],
    },
  },
  threadState: {},
  error: null,
});
