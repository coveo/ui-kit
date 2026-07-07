import type {Turn} from '@/src/core/interface/generative/generative-types.js';

export interface SerializedConverseState {
  turns: SerializedTurn[];
  activeTurnId: string | undefined;
}

export type SerializedTurn = Omit<Turn, 'routedInterface'> & {
  routedInterface?: {useCase: string} | undefined;
};
