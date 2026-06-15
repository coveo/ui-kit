import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateConversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import {getOrCreateConversationSelectors} from '@/src/core/internal/conversation/conversation-selectors.js';

const conversationLoadedKeys = new WeakMap<FullEngine, Set<string>>();

export const loadConversation = (
  engine: FullEngine,
  interfaceId: string = 'default'
) => {
  if (!conversationLoadedKeys.has(engine)) {
    conversationLoadedKeys.set(engine, new Set());
  }

  const loadedIds = conversationLoadedKeys.get(engine)!;
  if (loadedIds.has(interfaceId)) {
    return;
  }

  engine.adoptSlice(getOrCreateConversationSlice(interfaceId));

  const selectors = getOrCreateConversationSelectors(interfaceId);
  const registry = getEndpointContributorRegistry(engine);

  registry.register(conversationEndpointKey, () => {
    const sess = engine.read(selectors.getSession);
    const message = engine.read(selectors.getActiveTurnUserMessage);

    return {
      ...(message !== undefined ? {message} : {}),
      ...(sess.conversationSessionId !== undefined
        ? {conversationSessionId: sess.conversationSessionId}
        : {}),
      ...(sess.conversationToken !== undefined
        ? {conversationToken: sess.conversationToken}
        : {}),
    };
  });

  loadedIds.add(interfaceId);
};
