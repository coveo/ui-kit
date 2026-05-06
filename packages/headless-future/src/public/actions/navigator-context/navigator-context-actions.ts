import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {navigatorContextSlice} from '@/src/core/internal/navigator-context/navigator-context-slice.js';
import * as navigatorContextMutators from '@/src/core/interface/navigator-context/navigator-context-mutators.js';
import type {NavigatorContextState} from '@/src/core/interface/navigator-context/navigator-context-types.js';

type MutatorToAction<T> = T extends (...args: infer A) => any
  ? (...args: A) => void
  : never;

type MutatorsToActions<T> = {
  [K in keyof T]: MutatorToAction<T[K]>;
};

const loadedEngine = new WeakSet<Engine>();

const ensureLoaded = (engine: Engine) => {
  if (loadedEngine.has(engine)) {
    return;
  }

  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(navigatorContextSlice);
  loadedEngine.add(engine);
};

export const loadNavigatorContextActions = (
  engine: Engine
): MutatorsToActions<typeof navigatorContextMutators> => {
  ensureLoaded(engine);
  const fullEngine = getFullEngine(engine);

  return {
    setClientId: (clientId: string) => {
      fullEngine.mutate(navigatorContextMutators.setClientId(clientId));
    },
    setUserAgent: (userAgent: string | null) => {
      fullEngine.mutate(navigatorContextMutators.setUserAgent(userAgent));
    },
    setUrl: (url: string | null) => {
      fullEngine.mutate(navigatorContextMutators.setUrl(url));
    },
    setReferrer: (referrer: string | null) => {
      fullEngine.mutate(navigatorContextMutators.setReferrer(referrer));
    },
    setNavigatorContext: (context: NavigatorContextState) => {
      fullEngine.mutate(navigatorContextMutators.setNavigatorContext(context));
    },
  };
};
