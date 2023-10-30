import { emit } from "./emit/emit";
import { createClientIdManager } from "./client-id/client-id";
import { currentEnvironment } from "./environment/environment";
import { createRelayEvent } from "./event/relay-event";
import { version } from "./version";
import { createMeta, Meta } from "./event/meta/meta";
import { createListenerManager, EventCallback } from "./listener/listener";
import { createConfigManager, RelayConfig } from "./config/config";
import { ValidationError, ValidationResponse } from "./validate/validate";
import { buildNullEnvironment } from "./environment/null/null";

type RelayPayload = Record<string, unknown>;
type Off = () => void;

interface Relay {
  /**
   * Sends an event to the Event API.
   * @param {string} type - event's type to be emitted.
   * @param {RelayPayload} payload - payload to include within the event.
   * @returns {Promise<ValidationResponse | null>} the return value is typed ValidationResponse if the library configuration's mode is validate.
   */
  emit: (
    type: string,
    payload: RelayPayload
  ) => Promise<ValidationResponse | null>;

  /**
   * Gets the client-side generated meta object.
   * @param {string} type - event's type that will be included in the meta object.
   * @returns {Meta}
   */
  getMeta: (type: string) => Meta;

  /**
   * Attaches an event callback to either all event types or a specific one.
   * The callback set will be called when an event with the specified type is emitted.
   * Setting type as "*" will trigger the callback for all event types.
   * Returns the "off" function to detach the event callback.
   * @param {string} type - event's type.
   * @param {EventCallback} callback 
   * @returns {Off}
   */
  on: (type: string, callback: EventCallback) => Off;

  /**
   * Detach callback(s) from events.
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

  /**
   * Removes the visitorId cookie and localStorage key.
   * @returns {void}
   */
  clearStorage: () => void;
}

/**
 * Initializes the Relay library object.
 * @param {RelayConfig} initialConfig 
 * @returns {Relay}
 */
export function createRelay(initialConfig: RelayConfig): Relay {
  const configManager = createConfigManager(initialConfig);
  const listenerManager = createListenerManager();

  const getEnvironment = () =>
    configManager.get().mode == "disabled"
      ? buildNullEnvironment()
      : currentEnvironment();
  const clientIdManager = createClientIdManager(getEnvironment());

  return {
    emit: (type: string, payload: RelayPayload) => {
      const config = configManager.get();
      const environment = getEnvironment();

      const event = createRelayEvent(
        type,
        payload,
        config,
        environment,
        clientIdManager
      );

      return emit({
        config,
        environment,
        event,
        listenerManager,
      });
    },
    getMeta: (type: string) =>
      createMeta(type, configManager.get(), getEnvironment(), clientIdManager),
    on: (type: string, callback: EventCallback) =>
      listenerManager.add({ type, callback }),
    off: (type: string, callback?: EventCallback) =>
      listenerManager.remove(type, callback),
    updateConfig: (config: Partial<RelayConfig>) =>
      configManager.update(config),
    version,
    clearStorage: () => {
      clientIdManager.clear();
    },
  };
}

export type { RelayPayload, RelayConfig, ValidationError, ValidationResponse };
