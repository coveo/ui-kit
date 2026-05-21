import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import {conversationEndpointKey} from '@/src/core/interface/api/conversation-endpoint/conversation-endpoint-types.js';
import * as conversationSelectors from './conversation-selectors.js';

const conversationLoadedEngines = new WeakSet<FullEngine>();

export const loadConversation = (engine: FullEngine) => {
  if (conversationLoadedEngines.has(engine)) {
    return;
  }

  engine.adoptSlice(conversationSlice);

  const registry = getEndpointContributorRegistry(engine);
  registry.register(conversationEndpointKey, () => {
    const session = engine.read(conversationSelectors.session);

    return {
      ...(session.conversationSessionId !== undefined
        ? {conversationSessionId: session.conversationSessionId}
        : {}),
      ...(session.conversationToken !== undefined
        ? {conversationToken: session.conversationToken}
        : {}),
    };
  });

  conversationLoadedEngines.add(engine);
};
