import type {Unsubscribe} from '@/src/internal/engine/index.js';

export interface Controller<T = unknown> {
  /**
   * The current state of the controller.
   */
  readonly state: T;

  /**
   * Subscribes to controller state changes.
   *
   * @param listener - Invoked when the controller state changes.
   * @returns A function that unsubscribes the listener.
   */
  subscribe(listener: () => void): Unsubscribe;
}
