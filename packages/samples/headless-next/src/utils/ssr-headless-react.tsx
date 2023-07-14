import {Controller, CoreEngine, SearchEngine} from '@coveo/headless';
import {Context, use} from 'react';
import {useSyncMemoizedStore} from '@/hooks/use-sync-memoized-store';
import {useCallback, useContext, useMemo} from '@/hooks/wrapped';
import {mapObject} from '@/utils/object';
import {
  SearchEngineDefinitionOptions,
  defineSearchEngine as defineBaseSearchEngine,
} from './ssr-headless';
import {
  ControllerHook,
  InferControllerHooksMapFromDefinition,
  ReactSearchEngineDefinition,
} from './ssr-headless-react.types';
import {
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllerSnapshotsMapFromDefinitions,
  InferControllersMapFromDefinition,
} from './ssr-headless.types';

type ContextSnapshotState<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>
> = {controllers: InferControllerSnapshotsMapFromDefinitions<TControllers>};

type ContextLiveState<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>
> = {
  engine: TEngine;
  controllers: InferControllersMapFromDefinition<TControllers>;
};

type ContextState<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>
> =
  | ContextSnapshotState<TEngine, TControllers>
  | ContextLiveState<TEngine, TControllers>
  | null;

const isLiveContext = <
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>
>(
  ctx: Exclude<ContextState<TEngine, TControllers>, null>
): ctx is ContextLiveState<TEngine, TControllers> => 'engine' in ctx;

const buildControllerHook = <
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TKey extends keyof TControllers
>(
  getContext: () => Context<ContextState<TEngine, TControllers>>,
  key: TKey
): ControllerHook<InferControllerFromDefinition<TControllers[TKey]>> => {
  return () => {
    const ctx = useContext(getContext());
    if (ctx === null) {
      throw 'Missing snapshot or live provider.';
    }
    const subscribe = useCallback(
      (listener: () => void) =>
        isLiveContext(ctx)
          ? ctx.controllers[key].subscribe(listener)
          : () => {},
      [ctx]
    );
    const getSnapshot = useCallback(
      () =>
        isLiveContext(ctx)
          ? ctx.controllers[key].state
          : ctx.controllers[key].initialState,
      [ctx]
    );
    const state = useSyncMemoizedStore(subscribe, getSnapshot);
    const methods = useMemo(() => {
      if (!isLiveContext(ctx)) {
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
};

function singleton<T>(getValue: () => T) {
  let currentValue: T;
  let hasValue = false;
  return {
    get() {
      if (hasValue) {
        return currentValue;
      }
      currentValue = getValue();
      hasValue = true;
      return currentValue;
    },
  };
}

export function defineSearchEngine<
  TControllers extends ControllerDefinitionsMap<SearchEngine, Controller>
>(
  options: SearchEngineDefinitionOptions<TControllers>
): ReactSearchEngineDefinition<TControllers> {
  const genericDefinition = defineBaseSearchEngine({
    ...options,
  });
  const asyncContext = singleton(() =>
    import('react').then((r) =>
      r.createContext<ContextState<SearchEngine, TControllers>>(null)
    )
  );

  return {
    ...genericDefinition,
    useEngine() {
      const context = use(asyncContext.get());
      const ctx = useContext(context);
      if (ctx === null) {
        throw 'Missing snapshot or live provider.';
      }
      return isLiveContext(ctx) ? ctx.engine : undefined;
    },
    controllers: (options.controllers
      ? Object.fromEntries(
          Object.keys(options.controllers).map((key) => [
            `use${key.slice(0, 1).toUpperCase()}${key.slice(1)}`,
            buildControllerHook(
              () => use(asyncContext.get()),
              key as keyof TControllers
            ),
          ])
        )
      : {}) as InferControllerHooksMapFromDefinition<TControllers>,
    SnapshotProvider: ({controllers, children}) => {
      const {Provider} = use(asyncContext.get());
      return <Provider value={{controllers}}>{children}</Provider>;
    },
    LiveProvider: ({controllers, engine, children}) => {
      const {Provider} = use(asyncContext.get());
      return <Provider value={{engine, controllers}}>{children}</Provider>;
    },
  };
}
