import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {initialConversationEndpointState} from './conversation-endpoint-slice.js';

export function createConversationEndpointSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'conversationEndpoint',
    initialConversationEndpointState
  );

  return {
    getStatus: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.status
    ),
    getIsLoading: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.status !== 'idle'
    ),
    getError: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.error
    ),
    getStreaming: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.streaming
    ),
  };
}

const selectorsCache = new Map<
  string,
  ReturnType<typeof createConversationEndpointSelectors>
>();
export function getOrCreateConversationEndpointSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(
      interfaceId,
      createConversationEndpointSelectors(interfaceId)
    );
  }
  return selectorsCache.get(interfaceId)!;
}
