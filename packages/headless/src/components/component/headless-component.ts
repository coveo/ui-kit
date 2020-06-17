import {Engine} from '../../app/headless-engine';
import {HeadlessState} from '../../state';

export abstract class Component<State = HeadlessState> {
  constructor(protected engine: Engine<State>) {}

  /**
   * Adds a callback that will be called on state change.
   *
   * @param listener A callback to be invoked on state change.
   * @returns An unsubscribe function to remove the listener.
   */
  public subscribe(listener: () => void) {
    listener();
    return this.engine.subscribe(() => listener());
  }

  protected get dispatch() {
    return this.engine.dispatch;
  }
}
