import {Unsubscribe} from '@/src/core/index.js';

export interface Controller {
  /**
   * The current state of the controller.
   */
  readonly state: unknown;

  /**
   * Subscribes to controller state changes.
   *
   * @param callback - Invoked when the controller state changes.
   * @returns A function that unsubscribes the listener.
   */
  subscribe(callback: () => void): Unsubscribe;
}
