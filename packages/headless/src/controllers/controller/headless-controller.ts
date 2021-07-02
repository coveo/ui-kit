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
      prevState = JSON.stringify(this.state);
      return engine.subscribe(() => {
        if (hasStateChanged(this.state)) {
          listener();
        }
      });
    },

    get state() {
      return {};
    },
  };
}
