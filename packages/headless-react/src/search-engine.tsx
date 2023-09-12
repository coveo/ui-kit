import {Controller, CoreEngine, SearchEngine} from '@coveo/headless';
import {
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  SearchEngineDefinitionOptions,
  defineSearchEngine as defineBaseSearchEngine,
} from '@coveo/headless/ssr';
import {useContext, useCallback, useMemo, Context} from 'react';
// Workaround to prevent Next.js erroring about importing CSR only hooks
import React from 'react';
import {useSyncMemoizedStore} from './client-utils';
import {
  ContextHydratedState,
  ContextState,
  ControllerHook,
  InferControllerHooksMapFromDefinition,
  ReactSearchEngineDefinition,
} from './types';
import {SingletonGetter, capitalize, singleton, mapObject} from './utils';

export class MissingEngineProviderError extends Error {
  static message =
    'Unable to find Context. Please make sure you are wrapping your component with either `StaticStateProvider` or `CSRProvider` component that can provide the required context.';
  constructor() {
    super(MissingEngineProviderError.message);
  }
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
): ctx is ContextHydratedState<TEngine, TControllers> {
  return 'engine' in ctx;
}

function buildControllerHook<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TKey extends keyof TControllers,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers> | null>
  >,
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
    const getStaticState = useCallback(() => ctx.controllers[key].state, [ctx]);
    const state = useSyncMemoizedStore(subscribe, getStaticState);
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
    StaticStateProvider: ({controllers, children}) => {
      const {Provider} = singletonContext.get();
      return <Provider value={{controllers}}>{children}</Provider>;
    },
    CSRProvider: ({controllers, engine, children}) => {
      const {Provider} = singletonContext.get();
      return <Provider value={{engine, controllers}}>{children}</Provider>;
    },
  };
}
