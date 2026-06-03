import type {UnknownAction} from '@reduxjs/toolkit';
import type {ControllerStaticStateMap} from './controllers.js';

export interface EngineStaticState<
  TSearchAction extends UnknownAction,
  TControllers extends ControllerStaticStateMap,
> {
  /**
   * An array of Redux actions representing completed search operations that were executed when the static state was fetched.
   *
   * These actions capture the results of search requests (both successful and failed) performed on the server side.
   * During client-side hydration, these actions are replayed to restore the engine to the exact same state
   * it was in on the server, ensuring consistency between server-rendered and client-rendered content.
   *
   * Each action contains the search results, metadata, and any error information from the Search API responses.
   */
  searchActions: TSearchAction[];

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
> = Awaited<ReturnType<T['fetchStaticState']>>;

/**
 * Utility type to infer the hydrated state type from an engine definition's `hydrateStaticState` method.
 *
 * This type extracts the resolved type from the Promise returned by `hydrateStaticState`,
 * allowing you to work with the hydrated state type without manually specifying it.
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
> = Awaited<ReturnType<T['hydrateStaticState']>>;
