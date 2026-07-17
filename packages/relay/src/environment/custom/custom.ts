import type {Environment} from '../environment.js';

/**
 * Partial override of the `Environment` interface, used to customize Relay’s behavior
 * in non-standard browser runtimes.
 *
 * This type allows selective replacement of key environment functions without requiring
 * full control over all `Environment` responsibilities.
 */
export type CustomEnvironment = Pick<
  Environment,
  'getClientId' | 'getLocation' | 'getReferrer' | 'getUserAgent' | 'send'
>;
