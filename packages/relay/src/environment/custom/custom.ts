import type { Environment } from "../environment.js";
import type { Storage } from "../storage.js";

/**
 * Partial override of the `Environment` interface, used to customize Relay’s behavior
 * in non-standard browser runtimes.
 *
 * This type allows selective replacement of key environment functions without requiring
 * full control over all `Environment` responsibilities.
 */
export type CustomEnvironment = Pick<
  Environment,
  "generateUUID" | "getLocation" | "getReferrer" | "getUserAgent" | "send"
> & {
  /**
   * Optional custom implementation of a storage mechanism (e.g., in-memory, cookie-based).
   * If not provided, a null storage implementation will be used.
   * @type {Storage}
   */
  storage?: Storage;
};
