/**
 * `@coveo/thermidor/private`: **for internal Coveo use only.** Not supported for
 * customers; may change without notice, in any release.
 *
 * Exposes {@link createPrivateSession}, which opens a session whose request contract the
 * caller injects, so a Coveo internal application can call a private converse endpoint
 * with its own request fields. Customers use `createSession` from `@coveo/thermidor`.
 *
 * It also re-exports everything the root entry exports, so an internal application
 * imports from one entry.
 *
 * @packageDocumentation
 */

export {createPrivateSession} from '@/src/session/create-private-session.js';
export type {
  PrivateRequestContract,
  PrivateSessionConfig,
} from '@/src/session/create-private-session.js';

export * from '@/src/index.js';
