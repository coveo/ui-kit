import { RelayEvent } from "../event/relay-event";
import { Storage } from "./storage";

/**
 * Platform abstraction interface used by Relay to operate in different execution environments,
 * such as browsers, or custom contexts.
 */
export interface Environment {
  /**
   * Current runtime context for Relay. It has three possible values.
   * `"browser"` indicates a standard web environment.
   * `"null"` disables all side effects (e.g., for unit testing).
   * `"custom"` represents a user-supplied environment.
   * @type {"browser" | "null" | "custom"}
   */
  runtime: "browser" | "null" | "custom";

  /**
   * Sends an analytics event to the Event API.
   * @param {string} url - API endpoint where the event should be sent.
   * @param {string} token - API token used for authorization.
   * @param {RelayEvent} event - Event payload to send.
   * @returns {void}
   */
  send: (url: string, token: string, event: RelayEvent) => void;

  /**
   * Returns the first 1024 characters of the referring URL, or `null` if it is not available.
   * @returns {string|null}
   */
  getReferrer: () => string | null;

  /**
   * Returns the first 1024 characters of the current location (URL) context, or `null` if not available.
   * @returns {string|null}
   */
  getLocation: () => string | null;

  /**
   * Returns the current user agent string, or `null` if not available.
   * @returns {string|null}
   */
  getUserAgent: () => string | null;

  /**
   * Generates a UUID string.
   * @returns {string}
   */
  generateUUID: () => string;

  /**
   * Storage implementation used to persist data.
   * Should implement the standard `Storage` interface.
   * @type {Storage}
   */
  storage: Storage;
}
