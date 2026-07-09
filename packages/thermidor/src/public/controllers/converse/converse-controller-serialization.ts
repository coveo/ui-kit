import type {Turn} from '@/src/core/interface/generative/generative-types.js';

export interface SerializedConverseState {
  name: string;
  timestamp: number;
  conversationSessionId?: string;
  conversationToken?: string;
  turns: SerializedTurn[];
  activeTurnId: string | undefined;
}

export type SerializedTurn = Omit<Turn, 'routedInterface'> & {
  routedInterface?: {useCase: string} | undefined;
};
