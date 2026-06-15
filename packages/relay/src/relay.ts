import {emit} from './emit/emit.js';
import {createRelayEvent, type RelayEvent} from './event/relay-event.js';
import {version} from './version.js';
import {createMeta, type Meta, type EventConfig} from './event/meta/meta.js';
import {
  createListenerManager,
  type EventCallback,
} from './listener/listener.js';
import {createConfigManager, type RelayConfig} from './config/config.js';
import type {Environment} from './environment/environment.js';
import type {CustomEnvironment} from './environment/custom/custom.js';
import {createEnvironmentManager} from './environment/manager/manager.js';
import type {RelayPayload} from './relay-payload.js';
export {buildBrowserEnvironment} from './environment/browser/browser.js';
export {clientIdKey} from './constants.js';

/**
 * Function that detaches an event callback.
 * @typedef {function} Off
 * @returns {void}
 */
export type Off = () => void;

/**
 * Relay instance.
 * This object provides a comprehensive set of variables and methods for interacting with the Event API.
 */
interface Relay {
  /**
   * Sends an event to the Event API.
   * @param {string} type - event's type to be emitted.
   * @param {Record<string,any>} payload - payload to include within the event.
   * @returns {void}
   */
  emit: (type: string, payload: Record<string, any>) => Promise<void>;

  /**
   * Gets the client-side generated meta object.
   * @param {string} type - event's type that will be included in the meta object.
   * @returns {Meta}
   */
  getMeta: (type: string) => Meta;

  /**
   * Attaches an event callback to either all event types or a specific one.
   * The callback set will be called when an event with the specified type is emitted.
   * It’s not possible to modify the payload of the event sent to Coveo using this listener.
   * Setting type as "*" will trigger the callback for all event types.
   * Returns the "off" function to detach the event callback.
   * @param {string} type - event's type.
   * @param {EventCallback} callback - callback that should be called when the event is emitted.
   * @returns {Off}
   */
  on: (type: string, callback: EventCallback) => Off;

  /**
   * Detaches callbacks from events.
   * If only the "type" parameter is set, all callbacks for the specified type will be removed.
   * @param {string} type - event's type.
   * @param {EventCallback} callback - callback that should be removed.
   * @returns {void}
   */
  off: (type: string, callback?: EventCallback) => void;

  /**
   * Updates Relay's configuration after its initialization.
   * @param {Partial<RelayConfig>} config - configuration that should be updated.
   * @returns {void}
   */
  updateConfig: (config: Partial<RelayConfig>) => void;

  /**
   * Current version of the Relay library.
   */
  version: string;
}

/**
 * Initializes the Relay library object.
 * @param {RelayConfig} initialConfig
 * @returns {Relay}
 */
export function createRelay(initialConfig: RelayConfig): Relay {
  const configManager = createConfigManager(initialConfig);
  const listenerManager = createListenerManager();
  const environmentManager = createEnvironmentManager(configManager);

  return {
    emit: async (type: string, payload: Record<string, any>) => {
      const config = configManager.get();
      const environment = environmentManager.get();
      const event = createRelayEvent(type, payload, config, environment);

      return emit({
        config,
        environment,
        event,
        listenerManager,
      });
    },
    getMeta: (type: string) =>
      createMeta(type, configManager.get(), environmentManager.get()),
    on: (type: string, callback: EventCallback) =>
      listenerManager.add({type, callback}),
    off: (type: string, callback?: EventCallback) =>
      listenerManager.remove(type, callback),
    updateConfig: (config: Partial<RelayConfig>) =>
      configManager.update(config),
    version,
  };
}

export type {
  Relay,
  Meta,
  EventConfig,
  EventCallback,
  RelayConfig,
  RelayPayload,
  RelayEvent,
  CustomEnvironment,
  Environment,
};
