import type {Unsubscribe} from '@reduxjs/toolkit';
import type {CoreEngine, CoreEngineNext} from '../../app/engine.js';
import {type EngineMarker, engineMarkerKey} from '../../app/engine-marker.js';
import type {FrankensteinEngine} from '../../app/frankenstein-engine/frankenstein-engine.js';
import {
  commerceEngineKey,
  searchEngineKey,
} from '../../app/frankenstein-engine/frankenstein-engine-utils.js';

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

type AnyEngine<T extends object = object> =
  | CoreEngine<T>
  | CoreEngineNext<T>
  | FrankensteinEngine;

function getEngineMarker(engine: AnyEngine): EngineMarker | undefined {
  return (engine as {[engineMarkerKey]: EngineMarker | undefined})[
    engineMarkerKey
  ];
}

function validateEngineSupport(
  engine: AnyEngine,
  supportedEngines?: SupportedEngines
): void {
  if (!supportedEngines || supportedEngines.length === 0) {
    return;
  }

  const marker = getEngineMarker(engine);

  if (!marker) {
    return;
  }

  if (marker === 'frankenstein') {
    if (supportedEngines.includes('frankenstein')) {
      return;
    }
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

/**
 * Resolves the engine to use for controller subscription.
 *
 * When a Frankenstein engine is detected, routes to the appropriate sub-engine
 * based on the `supportedEngines` declaration:
 * - Controllers supporting 'search' are routed to the internal search sub-engine.
 * - Controllers supporting 'commerce' are routed to the internal commerce sub-engine.
 *
 * Controllers that only declare 'frankenstein' support are not yet implemented
 * and will be introduced in a future phase.
 */
function resolveEngine(
  engine: AnyEngine,
  supportedEngines?: SupportedEngines
): CoreEngine | CoreEngineNext {
  const marker = getEngineMarker(engine);

  if (marker !== 'frankenstein') {
    return engine as CoreEngine | CoreEngineNext;
  }

  const engineWithSubEngines = engine as unknown as Record<
    symbol,
    CoreEngine | CoreEngineNext
  >;

  if (supportedEngines?.includes('search')) {
    const subEngine = engineWithSubEngines[searchEngineKey];
    if (subEngine) {
      return subEngine;
    }
  }

  if (supportedEngines?.includes('commerce')) {
    const subEngine = engineWithSubEngines[commerceEngineKey];
    if (subEngine) {
      return subEngine;
    }
  }

  throw new Error(
    'Controllers that exclusively support the Frankenstein engine are not yet implemented. ' +
      "Use supportedEngines: ['search', 'frankenstein'] or ['commerce', 'frankenstein'] to route to a sub-engine."
  );
}

export function buildController<T extends object>(
  engine: AnyEngine<T>,
  options?: BuildControllerOptions
): Controller {
  validateEngineSupport(engine, options?.supportedEngines);

  const effectiveEngine = resolveEngine(engine, options?.supportedEngines);

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
        unsubscribe = effectiveEngine.subscribe(() => {
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
