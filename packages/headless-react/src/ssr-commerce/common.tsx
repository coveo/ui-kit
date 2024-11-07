import {
  Controller,
  ControllerDefinitionsMap,
  CoreEngineNext,
  InferControllerFromDefinition,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
  SolutionType,
} from '@coveo/headless/ssr-commerce';
import {
  useContext,
  useCallback,
  useMemo,
  Context,
  PropsWithChildren,
} from 'react';
import {SingletonGetter, capitalize, mapObject} from '../utils.js';
import {useSyncMemoizedStore} from './client-utils.js';
import {ContextHydratedState, ContextState, ControllerHook} from './types.js';

export class MissingEngineProviderError extends Error {
  static message =
    'Unable to find Context. Please make sure you are wrapping your component with either `StaticStateProvider` or `HydratedStateProvider` component that can provide the required context.';
  constructor() {
    super(MissingEngineProviderError.message);
  }
}

function isHydratedStateContext<
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TSolutionType extends SolutionType,
>(
  ctx: ContextState<TEngine, TControllers, TSolutionType>
): ctx is ContextHydratedState<TEngine, TControllers, TSolutionType> {
  return 'engine' in ctx;
}

function buildControllerHook<
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TKey extends keyof InferControllersMapFromDefinition<
    TControllers,
    TSolutionType
  >,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers, TSolutionType> | null>
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
    const controller = useMemo(() => {
      if (!isHydratedStateContext(ctx)) {
        return undefined;
      }
      const controller = ctx.controllers[key];
      const {state: _, subscribe: __, ...remainder} = controller;
      return mapObject(remainder, (member) =>
        typeof member === 'function' ? member.bind(controller) : member
      ) as Omit<
        InferControllerFromDefinition<TControllers[TKey]>,
        'state' | 'subscribe'
      >;
    }, [ctx, key]);
    return {state, controller};
  };
}

export function buildControllerHooks<
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers, TSolutionType> | null>
  >,
  controllersMap?: TControllers
) {
  return controllersMap
    ? Object.fromEntries(
        Object.keys(controllersMap).map((key) => [
          `use${capitalize(key)}`,
          buildControllerHook(
            singletonContext,
            key as keyof InferControllersMapFromDefinition<
              TControllers,
              TSolutionType
            >
          ),
        ])
      )
    : {};
}

export function buildEngineHook<
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers, TSolutionType> | null>
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
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers, TSolutionType> | null>
  >
) {
  return ({
    controllers,
    children,
  }: PropsWithChildren<{
    controllers: InferControllerStaticStateMapFromDefinitionsWithSolutionType<
      TControllers,
      TSolutionType
    >;
  }>) => {
    const {Provider} = singletonContext.get();
    return <Provider value={{controllers}}>{children}</Provider>;
  };
}

export function buildHydratedStateProvider<
  TEngine extends CoreEngineNext,
  TControllers extends ControllerDefinitionsMap<TEngine, Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TEngine, TControllers, TSolutionType> | null>
  >
) {
  return ({
    engine,
    controllers,
    children,
  }: PropsWithChildren<{
    engine: TEngine;
    controllers: InferControllersMapFromDefinition<TControllers, TSolutionType>;
  }>) => {
    const {Provider} = singletonContext.get();
    return <Provider value={{engine, controllers}}>{children}</Provider>;
  };
}
