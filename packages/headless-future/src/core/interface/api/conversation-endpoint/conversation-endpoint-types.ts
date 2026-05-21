import type {
  ConversationEndpointClientResult,
  CoveoConversationEndpointRequest,
} from '@/src/api/index.js';

export const conversationEndpointKey = 'conversation';

export type ConversationEndpointStatus = 'idle' | 'pending' | 'streaming';

export interface ConversationEndpointStreaming {
  isConnected: boolean;
}

export interface ConversationEndpointState {
  configuration: Record<string, any>;
  status: ConversationEndpointStatus;
  error: string | null;
  streaming: ConversationEndpointStreaming;
}

export type CoveoConversationEndpointRequestContributor =
  () => Partial<CoveoConversationEndpointRequest>;

export type ConversationEndpointCallResult = ConversationEndpointClientResult;
