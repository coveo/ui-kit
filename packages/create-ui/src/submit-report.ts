// Crash report submission (Sentry).
//
// TODO(KIT-5841): this module is an intentional skeleton. The real Sentry
// projection + upload (and its tests) land in a follow-up PR, together with the
// `@sentry/node` dependency. Until then the `report` subcommand explains that
// submission is not available yet, so no report is ever sent.

import {log} from './log.js';

/** Reads, projects, and submits a saved crash report to Sentry. */
export function submitReport(_reportReferenceOrPath: string | undefined): Promise<number> {
  // TODO(KIT-5841): read + parse the report, project it to a Sentry event, and flush.
  log.warn('Crash report submission is not available in this build yet.');
  return Promise.resolve(1);
}
