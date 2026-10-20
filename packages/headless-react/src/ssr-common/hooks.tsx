import {type Context, type PropsWithChildren, useCallback, useContext, useMemo} from 'react';
import {useSyncMemoizedStore} from '../client-utils.js';
import {MissingEngineProviderError, UndefinedControllerError} from '../errors.js';
import {capitalize, mapObject, type SingletonGetter} from '../utils.js';
import type {ControllerLike, EngineContextState, Hydration} from './types.js';

/**
 * @internal
 */
export type EngineContext = SingletonGetter<Context<EngineContextState | null>>;

function useEngineContext(singletonContext: EngineContext): EngineContextState {
  const ctx = useContext(singletonContext.get());
  if (ctx === null) {
    throw new MissingEngineProviderError();
  }
  return ctx;
}

const isHydrated = (ctx: EngineContextState) => !!ctx.engine;

/**
 * @internal
 */
export function buildControllerHook(
  singletonContext: EngineContext,
  key: string,
  supportedSolutionTypes: string[]
) {
  return () => {
    const ctx = useEngineContext(singletonContext);
    const controller = ctx.controllers[key];
    if (controller === undefined) {
      throw new UndefinedControllerError(key, supportedSolutionTypes);
    }

    const subscribe = useCallback(
      (listener: () => void) =>
        isHydrated(ctx) && controller.subscribe ? controller.subscribe(listener) : () => {},
      [ctx]
    );
    const getStaticState = useCallback(() => ctx.controllers[key].state, [ctx]);
    const state = useSyncMemoizedStore(subscribe, getStaticState);
    const methods = useMemo(() => {
      if (!isHydrated(ctx)) {
        return undefined;
      }
      const {
        state: _state,
        subscribe: _subscribe,
        ...remainder
      } = controller as ControllerLike & Record<string, unknown>;
      return mapObject(remainder, (member) =>
        typeof member === 'function' ? member.bind(controller) : member
      );
    }, [ctx]);

    return {state, methods};
  };
}

/**
 * @internal
 */
export function buildControllerHooks(
  singletonContext: EngineContext,
  controllersMap: Record<string, object> = {},
  getSupportedSolutionTypes: (definition: object) => string[] = () => []
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
export function buildEngineHook(singletonContext: EngineContext) {
  return () => {
    const ctx = useEngineContext(singletonContext);
    return isHydrated(ctx) ? ctx.engine : undefined;
  };
}

/**
 * @internal
 */
export function buildHydrationHook(singletonContext: EngineContext) {
  return (): Hydration => {
    const ctx = useEngineContext(singletonContext);
    if (ctx.hydrationError !== undefined) {
      return {status: 'error', error: ctx.hydrationError};
    }
    return {status: isHydrated(ctx) ? 'hydrated' : 'static'};
  };
}

/**
 * @internal
 */
export interface StateProviderProps {
  engine?: unknown;
  controllers: Record<string, ControllerLike>;
  hydrationError?: unknown;
}

/**
 * @internal
 */
export function buildStateProvider(singletonContext: EngineContext, solutionType?: string) {
  return ({
    engine,
    controllers,
    hydrationError,
    children,
  }: PropsWithChildren<StateProviderProps>) => {
    const {Provider} = singletonContext.get();
    return (
      <Provider value={{engine, controllers, solutionType, hydrationError}}>{children}</Provider>
    );
  };
}
