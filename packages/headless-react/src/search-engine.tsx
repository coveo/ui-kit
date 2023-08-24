import {Controller, CoreEngine, SearchEngine} from '@coveo/headless';
import {
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  SearchEngineDefinitionOptions,
  defineSearchEngine as defineBaseSearchEngine,
  mapObject,
} from '@coveo/headless/ssr';
import {useContext, useCallback, useMemo, Context} from 'react';
// Workaround to prevent Nextjs erroring about importing CSR only hooks
import React from 'react';
import {useSyncMemoizedStore} from './client-wrapper';
import {
  ContextCSRState,
  ContextState,
  ControllerHook,
  InferControllerHooksMapFromDefinition,
  ReactSearchEngineDefinition,
} from './types';

export class MissingEngineProviderError extends Error {
  constructor() {
    super(
      'Unable to find Context. Please make sure you are wrapping your component with either `SSRStateProvider` or `CSRProvider` component that can provide the required context.'
    );
  }
}

function capitalize(s: string) {
  return `${s.slice(0, 1).toUpperCase()}${s.slice(1)}`;
}

function singleton<T>(valueGetter: () => T) {
  let currentValue: T;
  let gotValue = false;
  return {
    get() {
      if (gotValue) {
        return currentValue;
      }
      currentValue = valueGetter();
      gotValue = true;
      return currentValue;
    },
  };
}

// Wrapper to workaround the limitation that `createContext()` cannot be called directly during SSR in next.js
export function createSingletonContext<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
>() {
  return singleton(() =>
    React.createContext<ContextState<SearchEngine, TControllers> | null>(null)
  );
}

function isCSRContext<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
>(
  ctx: ContextState<TEngine, TControllers>
): ctx is ContextCSRState<TEngine, TControllers> {
  return 'engine' in ctx;
}

function buildControllerHook<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TKey extends keyof TControllers,
>(
  singletonContext: {
    get(): Context<ContextState<TEngine, TControllers> | null>;
  },
  key: TKey
): ControllerHook<InferControllerFromDefinition<TControllers[TKey]>> {
  return () => {
    const ctx = useContext(singletonContext.get());
    if (ctx === null) {
      throw new MissingEngineProviderError();
    }
    const subscribe = useCallback(
      (listener: () => void) =>
        isCSRContext(ctx) ? ctx.controllers[key].subscribe(listener) : () => {},
      [ctx]
    );
    const getSSRState = useCallback(() => ctx.controllers[key].state, [ctx]);
    const state = useSyncMemoizedStore(subscribe, getSSRState);
    const methods = useMemo(() => {
      if (!isCSRContext(ctx)) {
        return undefined;
      }
      const controller = ctx.controllers[key];
      const {state: _, subscribe: __, ...remainder} = controller;
      return mapObject(remainder, (member) =>
        typeof member === 'function' ? member.bind(controller) : member
      ) as Omit<typeof controller, 'state' | 'subscribe'>;
    }, [ctx]);
    return {state, methods};
  };
}

/**
 * @internal
 * Returns controller hooks and SSR, CSR context providers that can be used to interact with a search engine
 *  in the server and client side respectively.
 */
export function defineSearchEngine<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
>(
  options: SearchEngineDefinitionOptions<TControllers>
): ReactSearchEngineDefinition<TControllers> {
  const singletonContext = createSingletonContext();
  return {
    ...defineBaseSearchEngine({...options}),
    useEngine() {
      const ctx = useContext(singletonContext.get());
      if (ctx === null) {
        throw new MissingEngineProviderError();
      }
      return isCSRContext(ctx) ? ctx.engine : undefined;
    },
    controllers: (options.controllers
      ? Object.fromEntries(
          Object.keys(options.controllers).map((key) => [
            `use${capitalize(key)}`,
            buildControllerHook(singletonContext, key),
          ])
        )
      : {}) as InferControllerHooksMapFromDefinition<TControllers>,
    SSRStateProvider: ({controllers, children}) => {
      const {Provider} = singletonContext.get();
      return <Provider value={{controllers}}>{children}</Provider>;
    },
    CSRProvider: ({controllers, engine, children}) => {
      const {Provider} = singletonContext.get();
      return <Provider value={{engine, controllers}}>{children}</Provider>;
    },
  };
}
