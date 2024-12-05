import {
  Controller,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllerStaticStateMapFromDefinitionsWithSolutionType,
  InferControllersMapFromDefinition,
  SolutionType,
  CommerceEngine as SSRCommerceEngine,
} from '@coveo/headless/ssr-commerce';
import {
  useContext,
  useCallback,
  useMemo,
  Context,
  PropsWithChildren,
} from 'react';
import {useSyncMemoizedStore} from '../client-utils.js';
import {
  MissingEngineProviderError,
  UndefinedControllerError,
} from '../errors.js';
import {SingletonGetter, capitalize, mapObject} from '../utils.js';
import {
  ContextHydratedState,
  ContextState,
  ControllerHook,
  InferControllerHooksMapFromDefinition,
} from './types.js';

function isHydratedStateContext<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  ctx: ContextState<TControllers, TSolutionType>
): ctx is ContextHydratedState<TControllers, TSolutionType> {
  return 'engine' in ctx;
}

function buildControllerHook<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TKey extends keyof TControllers,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TControllers, TSolutionType> | null>
  >,
  key: TKey
): ControllerHook<InferControllerFromDefinition<TControllers[TKey]>> {
  return () => {
    const ctx = useContext(singletonContext.get());
    if (ctx === null) {
      throw new MissingEngineProviderError();
    }

    // TODO: KIT-3715 - Workaround to ensure that 'key' can be used as an index for 'ctx.controllers'. A more robust solution is needed.
    type ControllerKey = Exclude<keyof typeof ctx.controllers, symbol>;
    if (ctx.controllers[key as ControllerKey] === undefined) {
      throw new UndefinedControllerError(key.toString(), ctx.solutionType);
    }

    const subscribe = useCallback(
      (listener: () => void) =>
        isHydratedStateContext(ctx)
          ? ctx.controllers[key as ControllerKey].subscribe(listener)
          : () => {},
      [ctx]
    );
    const getStaticState = useCallback(() => ctx.controllers[key].state, [ctx]);
    const state = useSyncMemoizedStore(subscribe, getStaticState);
    const methods = useMemo(() => {
      if (!isHydratedStateContext(ctx)) {
        return undefined;
      }
      const controller = ctx.controllers[key as ControllerKey];
      const {state: _, subscribe: __, ...remainder} = controller;
      return mapObject(remainder, (member) =>
        typeof member === 'function' ? member.bind(controller) : member
      ) as Omit<
        InferControllerFromDefinition<TControllers[TKey]>,
        'state' | 'subscribe'
      >;
    }, [ctx, key]);
    return {state, methods};
  };
}

export function buildControllerHooks<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TControllers, TSolutionType> | null>
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
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TControllers, TSolutionType> | null>
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
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TControllers, TSolutionType> | null>
  >,
  solutionType: TSolutionType
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
    return <Provider value={{controllers, solutionType}}>{children}</Provider>;
  };
}

export function buildHydratedStateProvider<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<
    Context<ContextState<TControllers, TSolutionType> | null>
  >,
  solutionType: TSolutionType
) {
  return ({
    engine,
    controllers,
    children,
  }: PropsWithChildren<{
    engine: SSRCommerceEngine;
    controllers: InferControllersMapFromDefinition<TControllers, TSolutionType>;
  }>) => {
    const {Provider} = singletonContext.get();
    return (
      <Provider value={{engine, controllers, solutionType}}>
        {children}
      </Provider>
    );
  };
}
