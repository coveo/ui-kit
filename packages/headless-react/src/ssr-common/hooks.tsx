import {type Context, type PropsWithChildren, useCallback, useContext, useMemo} from 'react';
import {useSyncMemoizedStore} from '../client-utils.js';
import {MissingEngineProviderError, UndefinedControllerError} from '../errors.js';
import {capitalize, mapObject, type SingletonGetter} from '../utils.js';
import type {ControllerLike, EngineContextState, Hydration, StateProviderProps} from './types.js';

/**
 * @internal
 */
/**
 * The React context that the providers of an engine definition share with its hooks.
 */
export type EngineContext<TEngine = unknown> = SingletonGetter<
  Context<EngineContextState<TEngine> | null>
>;

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
 * @internal
 */
function buildControllerHook<TEngine>(
  singletonContext: EngineContext<TEngine>,
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
export function buildControllerHooks<TEngine>(
  singletonContext: EngineContext<TEngine>,
  controllersMap: Record<string, object> = {},
  {
    getSupportedSolutionTypes = () => [],
    hookNames = {},
  }: {
    getSupportedSolutionTypes?: (definition: object) => string[];
    /**
     * The hooks not named `use<Name>` after their controller, such as the built-in `context`
     * controller, whose hook must not shadow React's `useContext`.
     */
    hookNames?: Record<string, string>;
  } = {}
) {
  return Object.fromEntries(
    Object.entries(controllersMap).map(([key, definition]) => [
      hookNames[key] ?? `use${capitalize(key)}`,
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
    if (ctx.hydrationError !== undefined) {
      return {status: 'error', error: ctx.hydrationError};
    }
    return {status: isHydrated(ctx) ? 'hydrated' : 'static'};
  };
}

/**
 * @internal
 */
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
    hydrationError,
    children,
  }: PropsWithChildren<
    StateProviderProps<
      {controllers: Record<string, ControllerLike>},
      {engine: TEngine; controllers: Record<string, ControllerLike>}
    >
  >) => {
    const {Provider} = singletonContext.get();
    return (
      <Provider value={{engine, controllers, solutionType, hydrationError}}>{children}</Provider>
    );
  };
}
