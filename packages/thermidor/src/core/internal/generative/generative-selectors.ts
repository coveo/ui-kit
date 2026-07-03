import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialGenerativeState} from './generative-slice.js';
import type {Turn} from '@/src/core/interface/generative/generative-types.js';

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
  };
}

export function getOrCreateGenerativeSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createGenerativeSelectors(stateId)
  );
}
