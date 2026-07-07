import {Turn} from '@/src/internal/features/generative/index.js';

export interface SerializedConverseState {
  turns: SerializedTurn[];
  activeTurnId: string | undefined;
}

export type SerializedTurn = Omit<Turn, 'routedInterface'> & {
  routedInterface?: {useCase: string} | undefined;
};
