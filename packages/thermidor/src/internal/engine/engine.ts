import {configureStore, combineSlices} from '@reduxjs/toolkit';
import type {Slice} from '@reduxjs/toolkit';
import type {ConfigurationState} from '@/src/internal/features/configuration/index.js';
import {configurationSlice} from '@/src/internal/features/configuration/index.js';
import {setConfiguration} from '@/src/internal/features/configuration/index.js';
import type {NavigatorContextProvider} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {
  Dispatchable,
  EngineOptions,
  State,
  StateChangeCallback,
  StateSelector,
  Unsubscribe,
} from './engine-types.js';

export type FullEngine = Engine & {
  adoptSlice(slice: Slice): Promise<void>;
  addInterface(iface: InterfaceHandle): void;
  removeInterface(iface: InterfaceHandle): void;
  getNavigatorContextProvider(): NavigatorContextProvider | undefined;
  mutate(mutation: Dispatchable): unknown;
  read<T>(selector: StateSelector<T>): T;
  subscribe<T>(selector: StateSelector<T>, callback: StateChangeCallback<T>): Unsubscribe;
};

export let getFullEngine: (engine: Engine) => FullEngine;

const fullEngineWrappers = new WeakMap<Engine, FullEngine>();

/**
 * The Thermidor engine: the framework-agnostic core that owns state and wires
 * the controllers and interfaces built against it. State management is fully
 * encapsulated (no store internals leak to consumers), and multiple independent
 * engine instances can coexist (multi-engine paradigm).
 *
 * @example
 * ```ts
 * const engine = new Engine({configuration});
 * const iface = buildGenerativeUnifiedInterface({engine});
 * // …build controllers from `iface`…
 * engine.dispose();
 * ```
 */
export class Engine {
  /** Whether this engine has been disposed. A disposed engine must not be used. */
  get disposed(): boolean {
    return this.#disposed;
  }

  #rootReducer = combineSlices({});
  #store = configureStore({reducer: this.#rootReducer});
  #adoptedSlices = new WeakSet<Slice>();
  #interfaces = new Set<InterfaceHandle>();
  #navigatorContextProvider: NavigatorContextProvider | undefined;
  #didWarnMissingNavigatorContextProvider = false;
  #disposed = false;

  static {
    getFullEngine = <typeof getFullEngine>((engine: Engine) => {
      const existingWrapper = fullEngineWrappers.get(engine);
      if (existingWrapper) {
        return existingWrapper;
      }

      const wrapper = {
        adoptSlice: (slice: Slice) => engine.#adoptSlice(slice),
        getNavigatorContextProvider: () => engine.#getNavigatorContextProvider(),
        mutate: (mutation: Dispatchable) => engine.#mutate(mutation),
        read: <T>(selector: StateSelector<T>) => engine.#read(selector),
        addInterface: (iface: InterfaceHandle) => engine.#addInterface(iface),
        removeInterface: (iface: InterfaceHandle) => engine.#removeInterface(iface),
        subscribe: <T>(selector: StateSelector<T>, callback: StateChangeCallback<T>) =>
          engine.#subscribe(selector, callback),
      } as FullEngine;

      fullEngineWrappers.set(engine, wrapper);

      return wrapper;
    });
  }

  /**
   * Creates a new engine.
   *
   * @param options - Optional initial configuration and navigator context provider.
   */
  constructor(options?: EngineOptions) {
    this.#_initializeConfiguration(options?.configuration);
    this.#_initializeNavigatorContext(options?.navigatorContextProvider);
  }

  /**
   * Disposes the engine and every interface built from it, releasing internal
   * resources. Idempotent; subsequent calls are no-ops.
   */
  dispose(): void {
    if (this.#disposed) {
      return;
    }
    this.#disposed = true;

    for (const iface of this.#interfaces) {
      iface.dispose();
    }

    this.#interfaces.clear();
    this.#navigatorContextProvider = undefined;
    fullEngineWrappers.delete(this);
  }

  async #adoptSlice(slice: Slice) {
    this.#assertNotDisposed();

    if (!this.#store) {
      throw new Error('Cannot adopt slice before store is initialized');
    }

    if (this.#adoptedSlices.has(slice)) {
      return;
    }

    this.#adoptedSlices.add(slice);
    this.#rootReducer.inject(slice);
    this.#mutate({type: '@@engine/ADOPT_SLICE'});
  }

  #addInterface(iface: InterfaceHandle): void {
    this.#assertNotDisposed();
    this.#interfaces.add(iface);
  }

  #removeInterface(iface: InterfaceHandle): void {
    this.#interfaces.delete(iface);
  }

  #getNavigatorContextProvider(): NavigatorContextProvider | undefined {
    this.#assertNotDisposed();

    if (!this.#navigatorContextProvider && !this.#didWarnMissingNavigatorContextProvider) {
      this.#didWarnMissingNavigatorContextProvider = true;
      console.warn(
        '[WARNING] Missing navigator context provider. Provide `navigatorContextProvider` in Engine options before using conversational requests.'
      );
    }

    return this.#navigatorContextProvider;
  }

  #mutate(mutation: Dispatchable): unknown {
    this.#assertNotDisposed();
    return this.#_getStore().dispatch(
      mutation as Parameters<ReturnType<typeof configureStore>['dispatch']>[0]
    );
  }

  #read<T>(selector: StateSelector<T>): T {
    this.#assertNotDisposed();
    return selector(this.#_getState());
  }

  #subscribe<T>(selector: StateSelector<T>, callback: StateChangeCallback<T>): Unsubscribe {
    this.#assertNotDisposed();

    // Track previous value to detect changes
    let previousValue = selector(this.#_getState());

    // Subscribe to store updates
    const unsubscribe = this.#_getStore().subscribe(() => {
      const currentValue = selector(this.#_getState());

      // Only invoke callback if value changed
      if (currentValue !== previousValue) {
        previousValue = currentValue;
        callback(currentValue);
      }
    });

    return unsubscribe;
  }

  #assertNotDisposed(): void {
    if (this.#disposed) {
      throw new Error('Cannot operate on a disposed Engine.');
    }
  }

  #_getStore() {
    if (!this.#store) {
      throw new Error('Headless not initialized. Call initialize() first.');
    }
    return this.#store;
  }

  #_getState(): State {
    return this.#_getStore().getState() as State;
  }

  #_initializeConfiguration(configuration?: ConfigurationState) {
    if (!configuration) {
      return;
    }

    this.#adoptSlice(configurationSlice);
    this.#mutate(setConfiguration(configuration));
  }

  #_initializeNavigatorContext(provider?: NavigatorContextProvider) {
    this.#navigatorContextProvider = provider;
  }
}
