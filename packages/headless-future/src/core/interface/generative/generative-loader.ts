import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateGenerativeSlice} from '@/src/core/internal/generative/generative-slice.js';
import {getOrCreateGenerativeSelectors} from '@/src/core/internal/generative/generative-selectors.js';
import {getEndpointContributorRegistry} from '@/src/core/internal/api/base-facade/endpoint-contributor-registry.js';
import {conversationEndpointKey} from '@/src/core/internal/api/base-facade/endpoint-keys.js';

const generativeLoadedKeys = new WeakMap<FullEngine, Set<string>>();

export const loadGenerative = (engine: FullEngine, interfaceId: string) => {
  if (!generativeLoadedKeys.has(engine)) {
    generativeLoadedKeys.set(engine, new Set());
  }

  const loadedIds = generativeLoadedKeys.get(engine)!;
  if (loadedIds.has(interfaceId)) {
    return;
  }

  engine.adoptSlice(getOrCreateGenerativeSlice(interfaceId));

  const selectors = getOrCreateGenerativeSelectors(interfaceId);
  const registry = getEndpointContributorRegistry(engine);

  registry.register(conversationEndpointKey, () => {
    const turns = engine.read(selectors.getTurns);
    const activeTurnId = engine.read(selectors.getActiveTurnId);

    const activeTurn = activeTurnId
      ? turns.find((t) => t.id === activeTurnId)
      : undefined;

    return {
      ...(activeTurn ? {message: activeTurn.prompt} : {}),
    };
  });

  loadedIds.add(interfaceId);
};
