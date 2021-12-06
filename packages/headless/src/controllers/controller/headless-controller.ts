import {Unsubscribe} from '@reduxjs/toolkit';
import {CoreEngine} from '../../app/engine';

export interface Controller {
  /**
   * Adds a callback that's invoked on state change.
   *
   * @param listener A callback that's invoked on state change.
   * @returns A function to remove the listener.
   */
  subscribe(listener: () => void): Unsubscribe;
  readonly state: {};
}

export function buildController<T extends object>(
  engine: CoreEngine<T>
): Controller {
  let prevState: string;
  const listeners: Map<Symbol, () => void> = new Map();
  const hasNoListeners = () => listeners.size === 0;

  const hasStateChanged = (
    currentState: Record<string, unknown>,
    symbol: Symbol
  ): boolean => {
    try {
      const stringifiedState = JSON.stringify(currentState);
      const hasChanged = prevState.get(symbol) !== stringifiedState;
      prevState.set(symbol, stringifiedState);
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
          unsubscribe && unsubscribe();
        }
      };
    },

    get state() {
      return {};
    },
  };
}
