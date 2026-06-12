import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import {session, activeTurnUserMessage} from './conversation-selectors.js';

const conversationLoadedEngines = new WeakSet<FullEngine>();

export const loadConversation = (engine: FullEngine) => {
  if (conversationLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(conversationSlice);

  const registry = getEndpointContributorRegistry(engine);
  registry.register(conversationEndpointKey, () => {
    const sess = engine.read(session);
    const message = engine.read(activeTurnUserMessage);

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

  conversationLoadedEngines.add(engine);
};
