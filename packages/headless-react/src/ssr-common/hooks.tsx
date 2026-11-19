import {type Context, type PropsWithChildren, useCallback, useContext, useMemo} from 'react';
import {useSyncMemoizedStore} from '../client-utils.js';
import {MissingEngineProviderError, UndefinedControllerError} from '../errors.js';
import {capitalize, mapObject, type SingletonGetter} from '../utils.js';
import type {ControllerLike, EngineContextState, Hydration, StateProviderProps} from './types.js';

/**
 * @internal The React context that the providers of an engine definition share with its hooks.
 */
export type EngineContext<TEngine> = SingletonGetter<Context<EngineContextState<TEngine> | null>>;

function useEngineContext<TEngine>(
  singletonContext: EngineContext<TEngine>
): EngineContextState<TEngine> {
  const ctx = useContext(singletonContext.get());
  if (ctx === null) {
    throw new MissingEngineProviderError();
  }
  return ctx;
}

const isHydrated = (ctx: EngineContextState<unknown>) => !!ctx.engine;

/**
 * Whether a controller found in the context is the live controller (once hydrated), rather than its
 * static state.
 */
function isLiveController(controller: ControllerLike): controller is Required<ControllerLike> {
  return typeof controller.subscribe === 'function';
}

function buildControllerHook<TEngine>(
  singletonContext: EngineContext<TEngine>,
  key: string,
  supportedSolutionTypes: string[]
) {
  return () => {
    const ctx = useEngineContext(singletonContext);
    // A hook exists for every controller of the definition, but each solution type builds only some of them.
    const controllersByName: Readonly<Record<string, ControllerLike | undefined>> = ctx.controllers;
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
      const {state: _state, subscribe: _subscribe, ...remainder} = controller;
      const members: Record<string, unknown> = remainder;
      return mapObject(members, (member) =>
        typeof member === 'function' ? member.bind(controller) : member
      );
    }, [controller]);

    return {state, methods};
  };
}

/**
 * @internal
 */
export function buildControllerHooks<TEngine>(
  singletonContext: EngineContext<TEngine>,
  controllersMap: Readonly<Record<string, unknown>> = {},
  getSupportedSolutionTypes: (definition: unknown) => string[] = () => []
) {
  return Object.fromEntries(
    Object.entries(controllersMap).map(([key, definition]) => [
      `use${capitalize(key)}`,
      buildControllerHook(singletonContext, key, getSupportedSolutionTypes(definition)),
    ])
  );
}

/**
 * @internal
 */
export function buildEngineHook<TEngine>(singletonContext: EngineContext<TEngine>) {
  return (): TEngine | undefined => {
    const ctx = useEngineContext(singletonContext);
    return isHydrated(ctx) ? ctx.engine : undefined;
  };
}

/**
 * @internal
 */
export function buildHydrationHook<TEngine>(singletonContext: EngineContext<TEngine>) {
  return (): Hydration => {
    const ctx = useEngineContext(singletonContext);
    if (ctx.hydrationFailure) {
      return {status: 'error', error: ctx.hydrationFailure.error};
    }
    return {status: isHydrated(ctx) ? 'hydrated' : 'static'};
  };
}

/**
 * @internal
 */
export function buildStateProvider<TEngine>(
  singletonContext: EngineContext<TEngine>,
  solutionType?: string
) {
  return ({
    engine,
    controllers,
    hydrationFailure,
    children,
  }: PropsWithChildren<
    StateProviderProps<
      {controllers: Record<string, ControllerLike>},
      {engine: TEngine; controllers: Record<string, ControllerLike>}
    >
  >) => {
    const {Provider} = singletonContext.get();
    return (
      <Provider value={{engine, controllers, solutionType, hydrationFailure}}>{children}</Provider>
    );
  };
}
