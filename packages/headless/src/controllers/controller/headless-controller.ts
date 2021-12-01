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
  const prevState: Map<Symbol, string> = new Map();

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
      prevState.set(symbol, JSON.stringify(this.state));
      const unsubscribe = engine.subscribe(() => {
        if (hasStateChanged(this.state, symbol)) {
          listener();
        }
      });
      return () => {
        prevState.delete(symbol);
        unsubscribe();
      };
    },

    get state() {
      return {};
    },
  };
}
