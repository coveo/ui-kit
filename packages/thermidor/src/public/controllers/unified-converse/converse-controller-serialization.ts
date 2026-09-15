import type {StateTurn} from '@/src/internal/features/generative/index.js';

export interface SerializedConverseState {
  name: string;
  timestamp: number;
  conversationSessionId?: string;
  conversationToken?: string;
  turns: SerializedTurn[];
  activeTurnId: string | undefined;
}

export type SerializedTurn = StateTurn;
