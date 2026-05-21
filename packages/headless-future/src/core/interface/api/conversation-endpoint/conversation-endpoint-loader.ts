import {conversationEndpointSlice} from '@/src/core/internal/api/conversation-endpoint/conversation-endpoint-slice.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {readConversationRequestDefaults} from '@/src/core/internal/configuration/configuration-reader.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';

const conversationEndpointLoadedEngines = new WeakSet<FullEngine>();

export const loadConversationEndpoint = (engine: FullEngine) => {
  if (conversationEndpointLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(conversationEndpointSlice);

  registerDefaultRequestContributors(engine);
  conversationEndpointLoadedEngines.add(engine);
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
