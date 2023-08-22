import {Controller, CoreEngine, SearchEngine} from '@coveo/headless';
import {
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  SearchEngineDefinitionOptions,
  defineSearchEngine as defineBaseSearchEngine,
  mapObject,
} from '@coveo/headless/ssr';
import {Context, useContext, useCallback, useMemo} from 'react';
import {createContext, useSyncMemoizedStore} from './client-wrapper';
import {
  ContextCSRState,
  ContextState,
  ControllerHook,
  InferControllerHooksMapFromDefinition,
  ReactSearchEngineDefinition,
} from './types';

export class MissingEngineProviderError extends Error {
  constructor(
    message = 'Unable to find Context. Please make sure you are wrapping your component with either `SSRStateProvider` or `CSRProvider` component that can provide the required context.'
  ) {
    super(message);
  }
}

function capitalize(s: string) {
  return `${s.slice(0, 1).toUpperCase()}${s.slice(1)}`;
}

function isCSRContext<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>
>(
  ctx: ContextState<TEngine, TControllers>
): ctx is ContextCSRState<TEngine, TControllers> {
  return 'engine' in ctx;
}

function buildControllerHook<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TKey extends keyof TControllers
>(
  context: Context<ContextState<TEngine, TControllers>>,
  key: TKey
): ControllerHook<InferControllerFromDefinition<TControllers[TKey]>> {
  return () => {
    const ctx = useContext(context);
    if (ctx === null) {
      throw new MissingEngineProviderError();
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
 */
export function defineSearchEngine<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
>(
  options: SearchEngineDefinitionOptions<TControllers>
): ReactSearchEngineDefinition<TControllers> {
  const context = createContext<ContextState<
    SearchEngine,
    TControllers
  > | null>(null);

  return {
    ...defineBaseSearchEngine({...options}),
    useEngine() {
      const ctx = useContext(context);
      if (ctx === null) {
        throw new MissingEngineProviderError();
      }
      return isCSRContext(ctx) ? ctx.engine : undefined;
    },
    controllers: (options.controllers
      ? Object.fromEntries(
          Object.keys(options.controllers).map((key) => [
            `use${capitalize(key)}`,
            buildControllerHook(
              context as Context<ContextState<SearchEngine<{}>, TControllers>>,
              key as keyof TControllers
            ),
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
