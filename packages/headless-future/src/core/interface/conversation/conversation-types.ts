export type ConversationMessageRole = 'user' | 'agent';

export interface ConversationMessage {
  id: string;
  role: ConversationMessageRole;
  content: string;
  createdAt: number;
}

type TurnStatusMap = {
  pending: never;
  streaming: never;
  completed: never;
  failed:
    | 'network_error'
    | 'auth_error'
    | 'stream_interrupted'
    | 'protocol_error';
  aborted: 'user_aborted';
};

export type TurnStatus = {
  [K in keyof TurnStatusMap]: TurnStatusMap[K] extends never
    ? {type: K}
    : {type: K; reason: TurnStatusMap[K]};
}[keyof TurnStatusMap];

export interface ConversationTurn {
  id: string;
  messageIds: string[];
  status: TurnStatus;
  createdAt: number;
  finalizedAt?: number;
}

export interface ConversationSession {
  conversationSessionId: string;
  conversationToken?: string;
}

export interface ConversationStreamingState {
  isConnected: boolean;
}

export interface ConversationControllerState {
  messages: ConversationMessage[];
  turns: ConversationTurn[];
  activeTurnId: string | null;
  session: ConversationSession;
  isLoading: boolean;
  error: string | null;
  streaming: ConversationStreamingState;
}
