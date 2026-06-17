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
