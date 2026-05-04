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
  ConfigurationState,
} from '@/src/core/interface/interface-types.js';
import {configurationSlice} from '../../internal/configuration/configuration-slice.js';

export type FullEngine = Engine & {
  adoptSlice(slice: Slice): Promise<void>;
  mutate(mutation: StateMutation): void;
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

  constructor(configuration?: ConfigurationState) {
    this.#adoptedSlices = new WeakSet<Slice>();
    this.#store = configureStore({reducer: this.#rootReducer});
    this.#initializeConfiguration(configuration);
  }

  static {
    getFullEngine = (engine: Engine) =>
      ({
        read: <T>(selector: StateSelector<T>) => engine.read(selector),
        subscribe: <T>(
          selector: StateSelector<T>,
          callback: StateChangeCallback<T>
        ) => engine.subscribe(selector, callback),
        adoptSlice: (slice: Slice) => engine.#adoptSlice(slice),
        mutate: (mutation: StateMutation) => engine.#mutate(mutation),
      }) as FullEngine;
  }

  #getStore() {
    if (!this.#store) {
      throw new Error('Headless not initialized. Call initialize() first.');
    }
    return this.#store;
  }

  #getState(): State {
    return this.#getStore().getState() as State;
  }

  #initializeConfiguration(configuration?: ConfigurationState) {
    if (!configuration) {
      return;
    }

    this.#adoptSlice(configurationSlice);
    this.#mutate(configurationSlice.actions.setConfiguration(configuration));
  }

  #mutate(mutation: StateMutation): void {
    this.#getStore().dispatch(mutation);
  }

  async #adoptSlice(slice: Slice) {
    if (!this.#store) {
      throw new Error('Cannot adopt slice before store is initialized');
    }

    if (this.#adoptedSlices.has(slice)) {
      // Slice already adopted, nothing to do
      return;
    }
    // Add slice to adopted set and update store reducer
    this.#adoptedSlices.add(slice);
    // Replace the store's reducer with the updated combined reducer
    this.#rootReducer.inject(slice);
    this.#mutate({type: '@@engine/ADOPT_SLICE'}); // Optional: dispatch an action to trigger state update
  }

  // ============================================================================
  // Public Instance Methods
  // ============================================================================

  /**
   * Read a value from the current state
   *
   * This provides synchronous access to state using a selector function.
   *
   * @template T The type of value to select
   * @param selector Function that extracts value from state
   * @returns The selected value
   *
   * @example
   * ```typescript
   * const query = engine.read(state => state.search.query);
   * const results = engine.read(state => state.search.results);
   * ```
   */
  read<T>(selector: StateSelector<T>): T {
    return selector(this.#getState());
  }

  /**
   * Subscribe to state changes
   *
   * Invokes the callback whenever the selected value changes.
   * Uses shallow equality check to detect changes.
   *
   * @template T The type of value to observe
   * @param selector Function that extracts value from state
   * @param callback Function invoked when value changes
   * @returns Unsubscribe function to cleanup subscription
   *
   * @example
   * ```typescript
   * const unsubscribe = engine.subscribe(
   *   state => state.search.query,
   *   (query) => console.log('Query changed:', query)
   * );
   *
   * // Later, cleanup
   * unsubscribe();
   * ```
   */
  subscribe<T>(
    selector: StateSelector<T>,
    callback: StateChangeCallback<T>
  ): Unsubscribe {
    // Track previous value to detect changes
    let previousValue = selector(this.#getState());

    // Subscribe to store updates
    const unsubscribe = this.#getStore().subscribe(() => {
      const currentValue = selector(this.#getState());

      // Only invoke callback if value changed
      if (currentValue !== previousValue) {
        previousValue = currentValue;
        callback(currentValue);
      }
    });

    return unsubscribe;
  }
}
