import {configureStore, combineSlices} from '@reduxjs/toolkit';
import type {Slice} from '@reduxjs/toolkit';
import type {ConfigurationState} from '@/src/core/interface/configuration/configuration-types.js';
import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';
import {setConfiguration} from '@/src/core/internal/configuration/configuration-actions.js';
import type {NavigatorContextProvider} from '@/src/core/interface/navigator-context/navigator-context-types.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/core/interface/generative/generative-hydration.js';
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
  getNavigatorContextProvider(): NavigatorContextProvider | undefined;
  mutate(mutation: Dispatchable): unknown;
  read<T>(selector: StateSelector<T>): T;
  storeHydrationSnapshot(
    interfaceId: string,
    content: Record<string, unknown>
  ): void;
  subscribe<T>(
    selector: StateSelector<T>,
    callback: StateChangeCallback<T>
  ): Unsubscribe;
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

  #disposed = false;
  #store: ReturnType<typeof configureStore>;
  #adoptedSlices: WeakSet<Slice>;
  #rootReducer = combineSlices({});
  #navigatorContextProvider: NavigatorContextProvider | undefined;
  #didWarnMissingNavigatorContextProvider = false;
  #hydrationSnapshots = new Map<string, Record<string, unknown>>();

  constructor(options?: EngineOptions) {
    this.#adoptedSlices = new WeakSet<Slice>();
    this.#store = configureStore({reducer: this.#rootReducer});

    this.#_initializeConfiguration(options?.configuration);
    this.#_initializeNavigatorContext(options?.navigatorContextProvider);
  }

  static {
    getFullEngine = (engine: Engine) => {
      const existingWrapper = fullEngineWrappers.get(engine);
      if (existingWrapper) {
        return existingWrapper;
      }

      const wrapper = {
        adoptSlice: (slice: Slice) => engine.#adoptSlice(slice),
        getNavigatorContextProvider: () =>
          engine.#getNavigatorContextProvider(),
        mutate: (mutation: Dispatchable) => engine.#mutate(mutation),
        read: <T>(selector: StateSelector<T>) => engine.#read(selector),
        storeHydrationSnapshot: (
          interfaceId: string,
          content: Record<string, unknown>
        ) => engine.#storeHydrationSnapshot(interfaceId, content),
        subscribe: <T>(
          selector: StateSelector<T>,
          callback: StateChangeCallback<T>
        ) => engine.#subscribe(selector, callback),
      } as FullEngine;

      fullEngineWrappers.set(engine, wrapper);

      return wrapper;
    };
  }

  dispose(): void {
    this.#disposed = true;
    this.#store = null!;
    this.#rootReducer = null!;
    this.#adoptedSlices = null!;
    this.#hydrationSnapshots.clear();
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

    const separatorIndex = slice.name.lastIndexOf('/');
    if (separatorIndex > 0) {
      const interfaceId = slice.name.substring(0, separatorIndex);
      if (this.#hydrationSnapshots.has(interfaceId)) {
        const content = this.#hydrationSnapshots.get(interfaceId)!;
        const hydrateAction = getOrCreateHydrateFromSnapshotAction(interfaceId);
        this.#mutate(hydrateAction(content));
      }
    }
  }

  #storeHydrationSnapshot(
    interfaceId: string,
    content: Record<string, unknown>
  ) {
    this.#hydrationSnapshots.set(interfaceId, content);
  }

  #getNavigatorContextProvider(): NavigatorContextProvider | undefined {
    if (
      !this.#navigatorContextProvider &&
      !this.#didWarnMissingNavigatorContextProvider
    ) {
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

  #subscribe<T>(
    selector: StateSelector<T>,
    callback: StateChangeCallback<T>
  ): Unsubscribe {
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
