import {Controller, CoreEngine, SearchEngine} from '@coveo/headless';
import {
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  SearchEngineDefinitionOptions,
  defineSearchEngine as defineBaseSearchEngine,
  mapObject,
} from '@coveo/headless/ssr';
import {
  Context,
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from 'react';
import {
  ContextCSRState,
  ContextState,
  ControllerHook,
  InferControllerHooksMapFromDefinition,
  ReactSearchEngineDefinition,
} from './types';

function capitalize(s: string) {
  return `${s.slice(0, 1).toUpperCase()}${s.slice(1)}`;
}

function isCSRContext<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
>(
  ctx: Exclude<ContextState<TEngine, TControllers>, null>
): ctx is ContextCSRState<TEngine, TControllers> {
  return 'engine' in ctx;
}

function buildControllerHook<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TKey extends keyof TControllers,
>(
  context: Context<ContextState<TEngine, TControllers>>,
  key: TKey
): ControllerHook<InferControllerFromDefinition<TControllers[TKey]>> {
  return () => {
    const ctx = useContext(context);
    if (ctx === null) {
      throw 'Missing SSR state or CSR provider.';
    }
    const subscribe = useCallback(
      (listener: () => void) =>
        isCSRContext(ctx) ? ctx.controllers[key].subscribe(listener) : () => {},
      [ctx]
    );
    const getSSRState = useCallback(() => ctx.controllers[key].state, [ctx]);
    // TODO: Eval need for `useSyncMemoizedStore() instead of useSyncExternalStore()`
    // const state = useSyncMemoizedStore(subscribe, getSSRState);
    // TODO: Eval `getServerSnapshot()` of `useSyncExternalStore`
    const state = useSyncExternalStore(subscribe, getSSRState, getSSRState);
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
 */
export function defineSearchEngine<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>,
>(
  options: SearchEngineDefinitionOptions<TControllers>
): ReactSearchEngineDefinition<TControllers> {
  const context = createContext<ContextState<SearchEngine, TControllers>>(null);

  return {
    ...defineBaseSearchEngine({...options}),
    useEngine() {
      const ctx = useContext(context);
      if (ctx === null) {
        throw 'Missing SSR state or CSR provider.';
      }
      return isCSRContext(ctx) ? ctx.engine : undefined;
    },
    controllers: (options.controllers
      ? Object.fromEntries(
          Object.keys(options.controllers).map((key) => [
            `use${capitalize(key)}`,
            buildControllerHook(context, key as keyof TControllers),
          ])
        )
      : {}) as InferControllerHooksMapFromDefinition<TControllers>,
    SSRStateProvider: ({controllers, children}) => {
      const {Provider} = context;
      return <Provider value={{controllers}}>{children}</Provider>;
    },
    CSRProvider: ({controllers, engine, children}) => {
      const {Provider} = context;
      return <Provider value={{engine, controllers}}>{children}</Provider>;
    },
  };
}
