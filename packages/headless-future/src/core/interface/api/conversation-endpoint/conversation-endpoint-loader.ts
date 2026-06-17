import {getOrCreateConversationEndpointSlice} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-slice.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';

const conversationEndpointLoadedKeys = new WeakMap<FullEngine, Set<string>>();

export const loadConversationEndpoint = (
  engine: FullEngine,
  interfaceId: string = 'default'
) => {
  if (!conversationEndpointLoadedKeys.has(engine)) {
    conversationEndpointLoadedKeys.set(engine, new Set());
  }

  const loadedIds = conversationEndpointLoadedKeys.get(engine)!;
  if (loadedIds.has(interfaceId)) {
    return;
  }

  engine.adoptSlice(getOrCreateConversationEndpointSlice(interfaceId));
  loadedIds.add(interfaceId);
};
