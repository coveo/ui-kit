import {Engine} from '../../app/headless-engine';

export abstract class Component {
  constructor(protected engine: Engine) {}

  /**
   * Adds a callback that will be called on state change.
   *
   * @param listener A callback to be invoked on state change.
   * @returns An unsubscibe function to remove the listener.
   */
  public subscribe(listener: () => void) {
    listener();
    return this.engine.subscribe(() => listener());
  }

  protected get dispatch() {
    return this.engine.dispatch;
  }
}
