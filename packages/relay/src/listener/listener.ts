import type {RelayEvent} from '../event/relay-event.js';

const ANY_EVENT_TYPE = '*';

/**
 * Callback to perform an action when a specified event is emitted.
 * @typedef {function} EventCallback
 * @param {RelayEvent} event - the Relay event payload that triggered the callback.
 * @returns {void}
 */
export type EventCallback = (event: RelayEvent) => void;

interface Listener {
  type: string;
  callback: EventCallback;
}

export interface ListenerManager {
  add: (listener: Listener) => () => void;
  call: (event: RelayEvent) => void;
  remove: (type: string, callback?: EventCallback) => void;
}

export function createListenerManager(): ListenerManager {
  const listeners: Listener[] = [];

  function getListenerIndex({type, callback}: Listener): number {
    return listeners.findIndex(
      (listener) => listener.type === type && listener.callback === callback
    );
  }

  function isMatchesType(listener: Listener, type: string): boolean {
    return listener.type === '*' || type === listener.type;
  }

  function add(listener: Listener): () => void {
    if (getListenerIndex(listener) < 0) {
      listeners.push(listener);
    }
    return () => remove(listener.type, listener.callback);
  }

  function call(event: RelayEvent) {
    listeners.forEach((listener) => {
      if (isMatchesType(listener, event.meta.type)) {
        try {
          listener.callback(event);
        } catch (e) {
          console.error(e);
        }
      }
    });
  }

  function removeMultiple(type: string) {
    if (type === ANY_EVENT_TYPE) {
      listeners.length = 0;
    } else {
      for (let i = listeners.length - 1; i >= 0; i--) {
        if (listeners[i].type === type) {
          listeners.splice(i, 1);
        }
      }
    }
  }

  function removeOne(listener: Listener) {
    const index = getListenerIndex(listener);
    if (index >= 0) {
      listeners.splice(index, 1);
    }
  }

  function remove(type: string, callback?: EventCallback) {
    if (callback) {
      removeOne({type, callback});
    } else {
      removeMultiple(type);
    }
  }

  return {
    add,
    call,
    remove,
  };
}
