import {
  Controller,
  CoreEngine,
  ProductRecommendationEngine,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  ProductRecommendationEngineDefinitionOptions,
  defineProductRecommendationEngine as defineBaseProductRecommendationEngine,
  ProductRecommendationEngineOptions,
} from '@coveo/headless/ssr/product-recommendation';
import {useContext, useCallback, useMemo, Context} from 'react';
// Workaround to prevent Next.js erroring about importing CSR only hooks
import React from 'react';
import {useSyncMemoizedStore} from '../client-utils.js';
import {
  ContextHydratedState,
  ContextState,
  ControllerHook,
  InferControllerHooksMapFromDefinition,
  ReactEngineDefinition,
} from '../types.js';
import {SingletonGetter, capitalize, singleton, mapObject} from '../utils.js';

export type ReactProductRecommendationEngineDefinition<
  TControllers extends ControllerDefinitionsMap<
    ProductRecommendationEngine,
    Controller
  >,
> = ReactEngineDefinition<
  ProductRecommendationEngine,
  TControllers,
  ProductRecommendationEngineOptions
>;

export class MissingEngineProviderError extends Error {
  static message =
    'Unable to find Context. Please make sure you are wrapping your component with either `StaticStateProvider` or `HydratedStateProvider` component that can provide the required context.';
  constructor() {
    super(MissingEngineProviderError.message);
  }
}

// Wrapper to workaround the limitation that `createContext()` cannot be called directly during SSR in next.js
export function createSingletonContext<
  TControllers extends ControllerDefinitionsMap<
    ProductRecommendationEngine,
    Controller
  >,
>() {
  return singleton(() =>
    React.createContext<ContextState<
      ProductRecommendationEngine,
      TControllers
    > | null>(null)
  );
}

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

/**
 * @internal
 * Returns controller hooks and SSR, CSR context providers that can be used to interact with a search engine
 *  in the server and client side respectively.
 */
export function defineProductRecommendationEngine<
  TControllers extends ControllerDefinitionsMap<
    ProductRecommendationEngine,
    Controller
  >,
>(
  options: ProductRecommendationEngineDefinitionOptions<TControllers>
): ReactProductRecommendationEngineDefinition<TControllers> {
  const singletonContext = createSingletonContext();
  return {
    ...defineBaseProductRecommendationEngine({...options}),
    useEngine() {
      const ctx = useContext(singletonContext.get());
      if (ctx === null) {
        throw new MissingEngineProviderError();
      }
      return isHydratedStateContext(ctx) ? ctx.engine : undefined;
    },
    controllers: (options.controllers
      ? Object.fromEntries(
          Object.keys(options.controllers).map((key) => [
            `use${capitalize(key)}`,
            buildControllerHook(singletonContext, key),
          ])
        )
      : {}) as InferControllerHooksMapFromDefinition<TControllers>,
    StaticStateProvider: ({controllers, children}) => {
      const {Provider} = singletonContext.get();
      return <Provider value={{controllers}}>{children}</Provider>;
    },
    HydratedStateProvider: ({controllers, engine, children}) => {
      const {Provider} = singletonContext.get();
      return <Provider value={{engine, controllers}}>{children}</Provider>;
    },
  };
}
