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
 * Store engine wrapper object to encapsulate state and avoid module-level side effects
 * Following the pattern from Coveo Headless
 *
 * Supports multi-engine paradigm - multiple independent engine instances can coexist
 */
export class Engine {
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

  constructor(options?: EngineOptions) {
    this.#_initializeConfiguration(options?.configuration);
    this.#_initializeNavigatorContext(options?.navigatorContextProvider);
  }

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
