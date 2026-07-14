import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
import {initialGenerativeState} from './generative-slice.js';
import type {Turn} from './generative-types.js';

type GenerativeSelectors = ReturnType<typeof createGenerativeSelectors>;

const CACHE_KEY: CacheKey<GenerativeSelectors> =
  createCacheKey<GenerativeSelectors>('generative/selectors');

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
    getConversationSessionId: createMemoizedStateSelector(
      sliceSelector,
      (state): string | undefined => state.conversationSessionId
    ),
    getConversationToken: createMemoizedStateSelector(
      sliceSelector,
      (state): string | undefined => state.conversationToken
    ),
  };
}

export function getOrCreateGenerativeSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createGenerativeSelectors(stateId)
  );
}
