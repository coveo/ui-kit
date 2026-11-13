import {
  type CommerceHydratedState,
  type CommerceStaticState,
  type Controller,
  type ControllerDefinition,
  type ControllerDefinitionsMap,
  SolutionType,
} from '@coveo/headless/ssr-commerce-next';
import {type Context, type PropsWithChildren, useCallback, useContext, useMemo} from 'react';
import {useSyncMemoizedStore} from '../client-utils.js';
import {MissingEngineProviderError, UndefinedControllerError} from '../errors.js';
import {capitalize, mapObject, type SingletonGetter} from '../utils.js';
import type {
  ContextHydratedState,
  ContextState,
  ControllerHook,
  InferControllerHooksMapFromDefinition,
  StateProviderProps,
} from './types.js';

function isHydratedStateContext<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  ctx: ContextState<TControllers, TSolutionType>
): ctx is ContextHydratedState<TControllers, TSolutionType> {
  return 'engine' in ctx && !!ctx.engine;
}

/**
 * Whether a controller found in the context is the live controller (once hydrated), rather than its
 * static state.
 */
function isLiveController(controller: {readonly state: {}}): controller is Controller {
  return 'subscribe' in controller && typeof controller.subscribe === 'function';
}

function buildControllerHook<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<Context<ContextState<TControllers, TSolutionType> | null>>,
  key: string,
  controllerDefinition: ControllerDefinition<Controller>
): ControllerHook<Controller> {
  return () => {
    const ctx = useContext(singletonContext.get());
    if (ctx === null) {
      throw new MissingEngineProviderError();
    }

    const allSolutionTypes = Object.values(SolutionType);

    const supportedSolutionTypes = allSolutionTypes.filter(
      (solutionType) => controllerDefinition[solutionType] === true
    );

    // A hook exists for every controller of the definition, but each solution type builds only some of them.
    const controllersByName: Readonly<Record<string, {readonly state: {}} | undefined>> =
      ctx.controllers;
    const controller = controllersByName[key];
    if (controller === undefined) {
      throw new UndefinedControllerError(key, supportedSolutionTypes);
    }

    const subscribe = useCallback(
      (listener: () => void) =>
        isLiveController(controller) ? controller.subscribe(listener) : () => {},
      [controller]
    );
    const getStaticState = useCallback(() => controller.state, [controller]);
    const state = useSyncMemoizedStore(subscribe, getStaticState);
    const methods = useMemo(() => {
      if (!isLiveController(controller)) {
        return undefined;
      }
      const {state: _, subscribe: __, ...remainder} = controller;
      return mapObject<string, unknown, unknown>(remainder, (member) =>
        typeof member === 'function' ? member.bind(controller) : member
      );
    }, [controller]);
    return {state, methods};
  };
}

export function buildControllerHooks<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<Context<ContextState<TControllers, TSolutionType> | null>>,
  controllersMap?: TControllers
) {
  return (
    controllersMap
      ? Object.fromEntries(
          Object.entries(controllersMap).map(([key, controllerDefinition]) => [
            `use${capitalize(key)}`,
            buildControllerHook(singletonContext, key, controllerDefinition),
          ])
        )
      : {}
  ) as InferControllerHooksMapFromDefinition<TControllers>;
}

export function buildEngineHook<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(singletonContext: SingletonGetter<Context<ContextState<TControllers, TSolutionType> | null>>) {
  return () => {
    const ctx = useContext(singletonContext.get());
    if (ctx === null) {
      throw new MissingEngineProviderError();
    }
    return isHydratedStateContext(ctx) ? ctx.engine : undefined;
  };
}

export function buildStateProvider<
  TControllers extends ControllerDefinitionsMap<Controller>,
  TSolutionType extends SolutionType,
>(
  singletonContext: SingletonGetter<Context<ContextState<TControllers, TSolutionType> | null>>,
  solutionType: TSolutionType
) {
  return ({
    engine,
    controllers,
    children,
  }: PropsWithChildren<
    StateProviderProps<
      CommerceStaticState<TControllers, TSolutionType>,
      CommerceHydratedState<TControllers, TSolutionType>
    >
  >) => {
    const {Provider} = singletonContext.get();
    return <Provider value={{engine, controllers, solutionType}}>{children}</Provider>;
  };
}
