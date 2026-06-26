import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {initialGenerativeState} from './generative-slice.js';
import type {Turn} from '@/src/core/interface/generative/generative-types.js';

export function createGenerativeSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'generative',
    initialGenerativeState
  );

  return {
    getTurns: createMemoizedStateSelector(
      sliceSelector,
      (state): Turn[] => state.turns
    ),
    getActiveTurnId: createMemoizedStateSelector(
      sliceSelector,
      (state): string | undefined => state.activeTurnId
    ),
    getActiveMessage: createMemoizedStateSelector(
      sliceSelector,
      (state): string => {
        if (!state.activeTurnId) {
          return '';
        }
        const turn = state.turns.find((t) => t.id === state.activeTurnId);
        return turn?.prompt ?? '';
      }
    ),
  };
}

export const getOrCreateGenerativeSelectors = SingletonFactory(
  createGenerativeSelectors
);
