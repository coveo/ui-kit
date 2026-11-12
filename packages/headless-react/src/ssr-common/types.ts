/**
 * The hydration status of the engine provided to a component tree.
 *
 * @group Hooks
 */
export type HydrationStatus = 'static' | 'hydrated' | 'error';

/**
 * What `useHydration()` returns.
 *
 * @group Hooks
 */
export interface Hydration {
  /**
   * `static` while the components render the static state fetched on the server, `hydrated` once the
   * engine is live in the browser, and `error` when the hydration failed and the provider's
   * `onHydrationError` option handles it.
   */
  status: HydrationStatus;
  /**
   * The error that made the hydration fail, when `status` is `error`.
   */
  error?: unknown;
}

/**
 * @internal
 */
export interface ControllerLike {
  state: unknown;
  subscribe?: (listener: () => void) => () => void;
}

/**
 * @internal The value that the providers of an engine definition share with its hooks.
 */
export interface EngineContextState {
  engine?: unknown;
  controllers: Record<string, ControllerLike>;
  solutionType?: string;
  hydrationError?: unknown;
}
