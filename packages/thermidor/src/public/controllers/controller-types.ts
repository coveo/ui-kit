import {Unsubscribe} from '@/src/internal/engine/index.js';

export interface Controller<T = unknown> {
  /**
   * The current state of the controller.
   */
  readonly state: T;

  /**
   * Subscribes to controller state changes.
   *
   * @param callback - Invoked with the new state when the controller state changes.
   * @returns A function that unsubscribes the listener.
   */
  subscribe(callback: (state: T) => void): Unsubscribe;
}
