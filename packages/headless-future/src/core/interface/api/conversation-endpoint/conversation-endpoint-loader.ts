import {getOrCreateConversationEndpointSlice} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-slice.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {readConversationRequestDefaults} from '@/src/core/internal/configuration/configuration-reader.js';
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
  registerDefaultRequestContributors(engine);
  loadedIds.add(interfaceId);
};

const registerDefaultRequestContributors = (engine: FullEngine) => {
  const registry = getEndpointContributorRegistry(engine);

  registry.register(conversationEndpointKey, () => {
    return readConversationRequestDefaults(engine);
  });

  registry.register(conversationEndpointKey, () => {
    const navigatorContext = engine.getNavigatorContextProvider()?.();

    return {
      context: {
        user: {
          ...(navigatorContext?.userAgent !== undefined
            ? {userAgent: navigatorContext.userAgent}
            : {}),
        },
        view: {
          ...(navigatorContext?.location !== undefined
            ? {url: navigatorContext.location}
            : {}),
          ...(navigatorContext?.referrer !== undefined
            ? {referrer: navigatorContext.referrer}
            : {}),
        },
      },
      ...(navigatorContext?.clientId !== undefined
        ? {clientId: navigatorContext.clientId}
        : {}),
    };
  });

  registry.register(conversationEndpointKey, () => ({
    targetEngine: 'AGENT_CORE',
  }));
};
