import {
  type AugmentedControllerDefinition,
  defineSearchEngine as defineBaseSearchEngine,
  defineSearchParameterManager,
  type SearchEngine,
  type SearchEngineDefinitionOptions,
} from '@coveo/headless/ssr-next';
// Workaround to prevent Next.js erroring about importing CSR only hooks
import React from 'react';
import {
  buildControllerHooks,
  buildEngineHook,
  buildHydrationHook,
  buildStateProvider,
  type EngineContext,
} from '../ssr-common/hooks.js';
import type {EngineContextState, Hydration} from '../ssr-common/types.js';
import {singleton} from '../utils.js';
import type {
  InferControllerHooksMapFromDefinition,
  ReactSearchEngineDefinition,
  SearchControllerDefinitionsMap,
} from './types.js';

// TODO: remove hack: KIT-5009
// Wrapper to workaround the limitation that `createContext()` cannot be called directly during SSR in next.js
function createSingletonContext(): EngineContext<SearchEngine> {
  return singleton(() => React.createContext<EngineContextState<SearchEngine> | null>(null));
}

/**
 * Defines a search engine for server-side rendering and returns its React hooks and engine definitions.
 *
 * @example
 * ```tsx
 * // lib/search-engine.ts, shared by the server and the browser
 * export const {
 *   searchEngineDefinition,
 *   standaloneEngineDefinition,
 *   useEngine,
 *   useHydration,
 *   controllers: {useSearchBox, useResultList, useParameterManager},
 * } = defineSearchEngine({
 *   configuration: {organizationId: '...', accessToken: '...'},
 *   controllers: {searchBox: defineSearchBox(), resultList: defineResultList()},
 * });
 * ```
 *
 * @param options - The engine configuration and the controllers to define.
 * @returns The `searchEngineDefinition` (executes a search on the server) and the
 * `standaloneEngineDefinition` (no server-side search), each with a `StateProvider`; `useEngine`;
 * `useHydration`; and one `use<Name>` hook per controller, including `useParameterManager`.
 *
 * @group Engine
 */
export function defineSearchEngine<TControllers extends SearchControllerDefinitionsMap = {}>(
  options: SearchEngineDefinitionOptions<TControllers>
): {
  /**
   * Returns the engine once the static state is hydrated, and `undefined` before.
   */
  useEngine: () => SearchEngine | undefined;
  /**
   * Returns whether the components render the static state, the hydrated engine, or a hydration error.
   */
  useHydration: () => Hydration;
  controllers: InferControllerHooksMapFromDefinition<AugmentedControllerDefinition<TControllers>>;
  searchEngineDefinition: ReactSearchEngineDefinition<TControllers>;
  standaloneEngineDefinition: ReactSearchEngineDefinition<TControllers>;
} {
  const singletonContext = createSingletonContext();

  const {searchEngineDefinition, standaloneEngineDefinition} = defineBaseSearchEngine(options);

  const controllerDefinitions: Readonly<Record<string, unknown>> = {
    ...options.controllers,
    parameterManager: defineSearchParameterManager(),
  };

  const StateProvider = buildStateProvider(singletonContext);

  return {
    useEngine: buildEngineHook(singletonContext),
    useHydration: buildHydrationHook(singletonContext),
    controllers: buildControllerHooks(
      singletonContext,
      controllerDefinitions
    ) as InferControllerHooksMapFromDefinition<AugmentedControllerDefinition<TControllers>>,
    searchEngineDefinition: {...searchEngineDefinition, StateProvider},
    standaloneEngineDefinition: {...standaloneEngineDefinition, StateProvider},
  };
}
