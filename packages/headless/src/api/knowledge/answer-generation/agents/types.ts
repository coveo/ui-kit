export interface AgentConfig {
  url: string;
  agentId: string;
}

export interface HeadAnswerAgentConfig extends AgentConfig {}

export interface FollowUpAgentConfig extends AgentConfig {
  threadId?: string;
}

export interface RunFollowUpInput {
  question: string;
  conversationId: string;
}
