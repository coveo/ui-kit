import type {
  Controller,
  ControllerDefinitionsMap,
  InferControllerFromDefinition,
  InferControllerStaticStateMapFromDefinitions,
  InferControllersMapFromDefinition,
  SearchEngine,
  SearchEngineDefinition,
} from '@coveo/headless/ssr-next';
import type {FunctionComponent, PropsWithChildren} from 'react';

export type {Hydration, HydrationStatus} from '../ssr-common/types.js';

export type SearchControllerDefinitionsMap = ControllerDefinitionsMap<SearchEngine, Controller>;

export type ContextState<TControllers extends SearchControllerDefinitionsMap> = {
  engine?: SearchEngine;
  controllers:
    | InferControllersMapFromDefinition<TControllers>
    | InferControllerStaticStateMapFromDefinitions<TControllers>;
  hydrationError?: unknown;
};

/**
 * A controller hook: the controller state, and its methods once the engine is hydrated.
 *
 * @group Hooks
 */
export type ControllerHook<TController extends Controller> = () => {
  state: TController['state'];
  methods?: Omit<TController, 'state' | 'subscribe'>;
};

/**
 * The hooks of an engine definition: one `use<Name>` hook per controller.
 *
 * @group Hooks
 */
export type InferControllerHooksMapFromDefinition<
  TControllers extends SearchControllerDefinitionsMap,
> = {
  [K in keyof TControllers as `use${Capitalize<K extends string ? K : never>}`]: ControllerHook<
    InferControllerFromDefinition<TControllers[K]>
  >;
};

/**
 * A search engine definition with the React `StateProvider` of its hooks.
 *
 * @group Engine
 */
export type ReactSearchEngineDefinition<TControllers extends SearchControllerDefinitionsMap> =
  SearchEngineDefinition<SearchEngine, TControllers> & {
    StateProvider: FunctionComponent<
      PropsWithChildren<{
        engine?: SearchEngine;
        controllers:
          | InferControllersMapFromDefinition<TControllers>
          | InferControllerStaticStateMapFromDefinitions<TControllers>;
        /**
         * @internal Set by the provider built with `buildProviderWithDefinition()` when the hydration fails.
         */
        hydrationError?: unknown;
      }>
    >;
  };
