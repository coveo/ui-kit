import type {RelayEvent} from '../event/relay-event.js';

/**
 * Platform abstraction interface used by Relay to operate in different execution environments,
 * such as browsers, or custom contexts.
 */
export interface Environment {
  /**
   * Current runtime context for Relay. It has three possible values.
   * `"browser"` indicates a standard web environment.
   * `"null"` disables all side effects (for example, for unit testing).
   * `"custom"` represents a user-supplied environment.
   * @type {"browser" | "null" | "custom"}
   */
  runtime: 'browser' | 'null' | 'custom';

  /**
   * Sends an analytics event to the Event API.
   * @param {string} url - API endpoint where the event should be sent.
   * @param {string} token - API token used for authorization.
   * @param {RelayEvent} event - Event payload to send.
   * @returns {Promise<void>}
   */
  send: (url: string, token: string, event: RelayEvent) => Promise<void>;

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
   * Returns the client identifier synchronously as a UUID string.
   *
   * The returned clientId must be unique per browser instance and stable across sessions
   * with the same top-level domain. The implementation is responsible for generating
   * a valid UUID and persisting it to ensure stability across sessions.
   * @returns {string}
   */
  getClientId: () => string;
}
