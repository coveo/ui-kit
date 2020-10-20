import {Engine} from '../../app/headless-engine';

export type Controller = ReturnType<typeof buildController>;

export function buildController<T>(engine: Engine<T>) {
  let prevState = '{}';

  const hasStateChanged = (currentState: T): boolean => {
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
    /**
     * Adds a callback that will be called on state change.
     *
     * @param listener A callback to be invoked on state change.
     * @returns An unsubscribe function to remove the listener.
     */
    subscribe(listener: () => void) {
      listener();
      return engine.subscribe(() => {
        if (hasStateChanged(this.state)) {
          listener();
        }
      });
    },

    get state() {
      return {} as T;
    },
  };
}
