import {
  Controller,
  ControllerDefinitionsMap,
  CoreEngine,
  InferControllerFromDefinition,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
} from '@coveo/headless/ssr';
import {
  useContext,
  useCallback,
  useMemo,
  Context,
  PropsWithChildren,
} from 'react';
import {useSyncMemoizedStore} from '../client-utils.js';
import {MissingEngineProviderError} from '../errors.js';
import {SingletonGetter, capitalize, mapObject} from '../utils.js';
import {
  ContextHydratedState,
  ContextState,
  ControllerHook,
  InferControllerHooksMapFromDefinition,
} from './types.js';

function isHydratedStateContext<
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
        isHydratedStateContext(ctx)
          ? ctx.controllers[key].subscribe(listener)
          : () => {},
      [ctx]
    );
    const getStaticState = useCallback(() => ctx.controllers[key].state, [ctx]);
    const state = useSyncMemoizedStore(subscribe, getStaticState);
    const methods = useMemo(() => {
      if (!isHydratedStateContext(ctx)) {
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

export function buildControllerHooks<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers> | null>
  >,
  controllersMap?: TControllers
) {
  return (
    controllersMap
      ? Object.fromEntries(
          Object.keys(controllersMap).map((key) => [
            `use${capitalize(key)}`,
            buildControllerHook(singletonContext, key),
          ])
        )
      : {}
  ) as InferControllerHooksMapFromDefinition<TControllers>;
}

export function buildEngineHook<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers> | null>
  >
) {
  return () => {
    const ctx = useContext(singletonContext.get());
    if (ctx === null) {
      throw new MissingEngineProviderError();
    }
    return isHydratedStateContext(ctx) ? ctx.engine : undefined;
  };
}

export function buildStaticStateProvider<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers> | null>
  >
) {
  return ({
    controllers,
    children,
  }: PropsWithChildren<{
    controllers: InferControllerStaticStateMapFromDefinitions<TControllers>;
  }>) => {
    const {Provider} = singletonContext.get();
    return <Provider value={{controllers}}>{children}</Provider>;
  };
}

export function buildHydratedStateProvider<
  TEngine extends CoreEngine,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers> | null>
  >
) {
  return ({
    engine,
    controllers,
    children,
  }: PropsWithChildren<{
    engine: TEngine;
    controllers: InferControllersMapFromDefinition<TControllers>;
  }>) => {
    const {Provider} = singletonContext.get();
    return <Provider value={{engine, controllers}}>{children}</Provider>;
  };
}
