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
 * A controller hook: the controller state, and its methods once the engine is hydrated.
 *
 * @group Hooks
 */
export type ControllerHook<TController extends {state: unknown}> = () => {
  state: TController['state'];
  methods?: Omit<TController, 'state' | 'subscribe'>;
};

/**
 * @internal
 */
export interface ControllerLike {
  state: unknown;
  subscribe?: (listener: () => void) => () => void;
}

/**
 * The props of the `StateProvider` of an engine definition: the controllers that its hooks read (their
 * static state, or the live controllers once hydrated) and the hydrated engine.
 *
 * @typeParam TStaticState - The static state of the engine definition.
 * @typeParam THydratedState - The hydrated state of the engine definition.
 *
 * @group Providers
 */
export interface StateProviderProps<
  TStaticState extends {controllers: object},
  THydratedState extends {engine: unknown; controllers: object},
> {
  engine?: THydratedState['engine'];
  controllers: TStaticState['controllers'] | THydratedState['controllers'];
  /**
   * @internal Set by the provider built with `buildProviderWithDefinition()` when the hydration fails.
   */
  hydrationFailure?: {error: unknown};
}

/**
 * @internal The value that the providers of an engine definition share with its hooks.
 */
export interface EngineContextState<TEngine> {
  engine?: TEngine;
  controllers: Record<string, ControllerLike>;
  solutionType?: string;
  hydrationFailure?: {error: unknown};
}
