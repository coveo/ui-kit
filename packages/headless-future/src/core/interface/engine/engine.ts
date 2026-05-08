/**
 * Layer 0 Interface: Core Engine Operations
 *
 * Provides library-agnostic read, subscribe, and mutation API.
 * This file is PUBLIC to Layers 1-3 (via core/index.ts).
 *
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {configureStore, combineSlices} from '@reduxjs/toolkit';
import type {Slice} from '@reduxjs/toolkit';
import type {
  State,
  Unsubscribe,
  StateSelector,
  StateChangeCallback,
  StateMutation,
} from '@/src/core/interface/interface-types.js';
import type {ConfigurationState} from '@/src/core/interface/configuration/configuration-types.js';
import {configurationSlice} from '../../internal/configuration/configuration-slice.js';
import type {EngineOptions} from '@/src/core/interface/engine/engine-types.js';
import type {NavigatorContextProvider} from '@/src/core/interface/navigator-context/navigator-context-types.js';

export type FullEngine = Engine & {
  adoptSlice(slice: Slice): Promise<void>;
  getNavigatorContextProvider(): NavigatorContextProvider | undefined;
  mutate(mutation: StateMutation): void;
  read<T>(selector: StateSelector<T>): T;
  subscribe<T>(
    selector: StateSelector<T>,
    callback: StateChangeCallback<T>
  ): Unsubscribe;
};

export let getFullEngine: (engine: Engine) => FullEngine;

/**
 * Store engine wrapper object to encapsulate state and avoid module-level side effects
 * Following the pattern from Coveo Headless
 *
 * Supports multi-engine paradigm - multiple independent engine instances can coexist
 */
export class Engine {
  #store: ReturnType<typeof configureStore>;
  #adoptedSlices: WeakSet<Slice>;
  #rootReducer = combineSlices({});
  #navigatorContextProvider: NavigatorContextProvider | undefined;
  #didWarnMissingNavigatorContextProvider = false;

  constructor(options?: EngineOptions) {
    this.#adoptedSlices = new WeakSet<Slice>();
    this.#store = configureStore({reducer: this.#rootReducer});

    this.#_initializeConfiguration(options?.configuration);
    this.#_initializeNavigatorContext(options?.navigatorContextProvider);
  }

  static {
    getFullEngine = (engine: Engine) =>
      ({
        adoptSlice: (slice: Slice) => engine.#adoptSlice(slice),
        getNavigatorContextProvider: () =>
          engine.#getNavigatorContextProvider(),
        mutate: (mutation: StateMutation) => engine.#mutate(mutation),
        read: <T>(selector: StateSelector<T>) => engine.#read(selector),
        subscribe: <T>(
          selector: StateSelector<T>,
          callback: StateChangeCallback<T>
        ) => engine.#subscribe(selector, callback),
      }) as FullEngine;
  }

  async #adoptSlice(slice: Slice) {
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

  #mutate(mutation: StateMutation): void {
    this.#_getStore().dispatch(mutation);
  }

  #read<T>(selector: StateSelector<T>): T {
    return selector(this.#_getState());
  }

  #subscribe<T>(
    selector: StateSelector<T>,
    callback: StateChangeCallback<T>
  ): Unsubscribe {
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
    this.#mutate(configurationSlice.actions.setConfiguration(configuration));
  }

  #_initializeNavigatorContext(provider?: NavigatorContextProvider) {
    this.#navigatorContextProvider = provider;
  }
}
