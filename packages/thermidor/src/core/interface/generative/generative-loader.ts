import {FullEngine} from '@/src/core/interface/engine/engine.js';
import {getOrCreateGenerativeSlice} from '@/src/core/internal/generative/generative-slice.js';

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
  loadedIds.add(interfaceId);
};
