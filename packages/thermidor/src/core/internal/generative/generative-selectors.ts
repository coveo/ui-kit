import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
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
    getConversationSessionId: createMemoizedStateSelector(
      sliceSelector,
      (state): string | undefined => state.conversationSessionId
    ),
    getConversationToken: createMemoizedStateSelector(
      sliceSelector,
      (state): string | undefined => state.conversationToken
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

const selectorsCache = new Map<
  string,
  ReturnType<typeof createGenerativeSelectors>
>();

export function getOrCreateGenerativeSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createGenerativeSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
