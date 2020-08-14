import {Engine} from '../../app/headless-engine';

export type Controller = ReturnType<typeof buildController>;

export function buildController(engine: Engine) {
  const subscribe = (listener: () => void) => {
    listener();
    return engine.subscribe(() => listener());
  };

  return {
    /**
     * Adds a callback that will be called on state change.
     *
     * @param listener A callback to be invoked on state change.
     * @returns An unsubscribe function to remove the listener.
     */
    subscribe,
  };
}
