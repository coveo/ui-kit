import type {UnknownAction} from '@reduxjs/toolkit';
import type {ControllerStaticStateMap} from './controllers.js';

/**
 * The contract every engine definition fulfils: `fetchStaticState()` returns the static state of a
 * page, and `hydrateStaticState()` takes that static state, as is, and returns the engine and the
 * live controllers.
 *
 * Use it to type code that works with any engine definition, such as a provider or a framework
 * integration. The static and hydrated states are inferred from the definition passed in, so the
 * controllers stay typed.
 *
 * @typeParam TStaticState - The static state returned by `fetchStaticState()`.
 * @typeParam THydratedState - The engine and the live controllers returned by `hydrateStaticState()`.
 * @typeParam TFetchOptions - The options of `fetchStaticState()`. Leave it out in code that only
 *  hydrates.
 *
 * @example
 * ```typescript
 * function hydrate<TStaticState, THydratedState>(
 *   definition: EngineDefinition<TStaticState, THydratedState>,
 *   staticState: TStaticState
 * ) {
 *   return definition.hydrateStaticState(staticState);
 * }
 *
 * const {controllers} = await hydrate(searchEngineDefinition, staticState);
 * ```
 *
 * @group Engine
 */
export interface EngineDefinition<TStaticState, THydratedState, TFetchOptions = never> {
  /**
   * Fetches the static state of a page on the server.
   */
  fetchStaticState: (options: TFetchOptions) => Promise<TStaticState>;
  /**
   * Builds the engine and the live controllers in the browser, from the static state.
   */
  hydrateStaticState: (staticState: TStaticState) => Promise<THydratedState>;
}

export interface EngineStaticState<TControllers extends ControllerStaticStateMap> {
  /**
   * An array of Redux actions representing completed search operations that were executed when the static state was fetched.
   *
   * These actions capture the results of search requests (both successful and failed) performed on the server side.
   * During client-side hydration, these actions are replayed to restore the engine to the exact same state
   * it was in on the server, ensuring consistency between server-rendered and client-rendered content.
   *
   * Each action contains the search results, metadata, and any error information from the Search API responses.
   */
  searchActions: UnknownAction[];

  /**
   * A map of controller static states, where each key is the controller name and
   * each value contains the serializable state of that controller.
   */
  controllers: TControllers;
}

/**
 * Utility type to infer the static state type from an engine definition's `fetchStaticState` method.
 *
 * This type extracts the resolved type from the Promise returned by `fetchStaticState`,
 * allowing you to work with the static state type without manually specifying it.
 * Editor tooltips and compiler errors show it under its own name, such as `SearchStaticState`.
 *
 * @template T - An object with a `fetchStaticState` method that returns a Promise
 *
 * @example
 * ```typescript
 * const searchEngineDefinition = defineSearchEngine({
 *   configuration: { organizationId: 'myorg', accessToken: 'token' },
 *   controllers: { searchBox: defineSearchBox() }
 * });
 *
 * type StaticState = InferStaticState<typeof searchEngineDefinition>;
 * ```
 *
 * @group Engine
 */
export type InferStaticState<
  T extends {
    fetchStaticState(...args: unknown[]): Promise<unknown>;
  },
> = ReturnType<T['fetchStaticState']> extends Promise<infer TStaticState> ? TStaticState : never;

/**
 * Utility type to infer the hydrated state type from an engine definition's `hydrateStaticState` method.
 *
 * This type extracts the resolved type from the Promise returned by `hydrateStaticState`,
 * allowing you to work with the hydrated state type without manually specifying it.
 * Editor tooltips and compiler errors show it under its own name, such as `SearchHydratedState`.
 *
 * @template T - An object with a `hydrateStaticState` method that returns a Promise
 *
 * @example
 * ```typescript
 * const searchEngineDefinition = defineSearchEngine({
 *   configuration: { organizationId: 'myorg', accessToken: 'token' },
 *   controllers: { searchBox: defineSearchBox() }
 * });
 *
 * type HydratedState = InferHydratedState<typeof searchEngineDefinition>;
 * ```
 *
 * @group Engine
 */
export type InferHydratedState<
  T extends {
    hydrateStaticState(...args: unknown[]): Promise<unknown>;
  },
> =
  ReturnType<T['hydrateStaticState']> extends Promise<infer THydratedState>
    ? THydratedState
    : never;
