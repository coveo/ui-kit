import type {Unsubscribe} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import {type EngineMarker, engineMarkerKey} from '../../app/engine-marker.js';

export interface Subscribable {
  /**
   * Adds a callback that's invoked on state change.
   *
   * @param listener A callback that's invoked on state change.
   * @returns A function to remove the listener.
   */
  subscribe(listener: () => void): Unsubscribe;
}

export interface Controller extends Subscribable {
  readonly state: {};
}

/**
 * Engine types that a controller can declare support for.
 *
 * @internal
 */
export type SupportedEngines = EngineMarker[];

interface BuildControllerOptions {
  /**
   * The engine types this controller supports.
   * When provided, a runtime check validates that the engine type is compatible.
   *
   * @internal
   */
  supportedEngines?: SupportedEngines;
}

function validateEngineSupport(
  engine: CoreEngine | CoreEngineNext,
  supportedEngines?: SupportedEngines
): void {
  if (!supportedEngines || supportedEngines.length === 0) {
    return;
  }

  const marker = (
    engine as CoreEngine & {[engineMarkerKey]: EngineMarker | undefined}
  )[engineMarkerKey];

  if (!marker) {
    return;
  }

  if (marker === 'frankenstein') {
    // Frankenstein engine is compatible if the controller supports 'frankenstein'
    // or if it supports the specific sub-engine type (routing will happen later in Phase 2).
    if (supportedEngines.includes('frankenstein')) {
      return;
    }
    // For Phase 1, if a controller supports 'search' or 'commerce' and is used with a
    // Frankenstein engine, we allow it (sub-engine routing will handle this in Phase 2).
    if (
      supportedEngines.includes('search') ||
      supportedEngines.includes('commerce')
    ) {
      return;
    }
    throw new Error(
      `This controller does not support the Frankenstein engine. ` +
        `Supported engine types: [${supportedEngines.join(', ')}].`
    );
  }

  if (!supportedEngines.includes(marker)) {
    throw new Error(
      `This controller does not support the "${marker}" engine. ` +
        `Supported engine types: [${supportedEngines.join(', ')}].`
    );
  }
}

export function buildController<T extends object>(
  engine: CoreEngine<T> | CoreEngineNext<T>,
  options?: BuildControllerOptions
): Controller {
  validateEngineSupport(engine, options?.supportedEngines);

  let prevState: string;
  const listeners: Map<Symbol, () => void> = new Map();
  const hasNoListeners = () => listeners.size === 0;

  const hasStateChanged = (currentState: Record<string, unknown>): boolean => {
    try {
      const stringifiedState = JSON.stringify(currentState);
      const hasChanged = prevState !== stringifiedState;
      prevState = stringifiedState;
      return hasChanged;
    } catch (e) {
      console.warn(
        'Could not detect if state has changed, check the controller "get state method"',
        e
      );
      return true;
    }
  };

  return {
    subscribe(listener: () => void) {
      listener();
      const symbol = Symbol();
      let unsubscribe: () => void;

      if (hasNoListeners()) {
        prevState = JSON.stringify(this.state);
        unsubscribe = engine.subscribe(() => {
          if (hasStateChanged(this.state)) {
            listeners.forEach((listener) => listener());
          }
        });
      }
      listeners.set(symbol, listener);

      return () => {
        listeners.delete(symbol);
        if (hasNoListeners()) {
          unsubscribe?.();
        }
      };
    },

    get state() {
      return {};
    },
  };
}
