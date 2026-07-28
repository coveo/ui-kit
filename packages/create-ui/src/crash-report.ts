// Crash report generation.
//
// TODO(KIT-5841): this module is an intentional skeleton. The real report model,
// path redaction, serialization, and on-disk read/write (and their tests) land
// in a follow-up PR. Only the run-context accumulator and the signatures the CLI
// wiring depends on are provided here as no-op stubs, so the scaffold flow runs
// unchanged while the crash-reporting funnel is built up.

import type {ProjectMetadata} from './metadata.js';

const CRASH_ORIGINS = [
  'unknown',
  'uncaught-exception',
  'unhandled-rejection',
  'main-rejection',
] as const;

export type CrashOrigin = (typeof CRASH_ORIGINS)[number];

export interface RunContext {
  template?: string;
  templateVersion?: string;
  metadata?: ProjectMetadata;
}

export interface CrashReport {
  runId: string;
}

let currentContext: RunContext = {};

/** Accumulates run context so it is available once report building is implemented. */
export function setRunContext(update: RunContext): void {
  currentContext = {...currentContext, ...update};
}

/** Builds a crash report from the error, diagnostics snapshot, and run context. */
export function buildCrashReport(_error: unknown, _origin: CrashOrigin = 'unknown'): CrashReport {
  // TODO(KIT-5841): assemble the full report from the error, diagnostics, and run context.
  return {runId: ''};
}

/** Derives the stable short reference used by the `report` submit command. */
export function crashReportReference(runId: string): string {
  // TODO(KIT-5841): derive the stable short reference.
  return runId;
}

/** Persists the report under the crash-reports directory and returns its path. */
export function writeCrashReport(_report: CrashReport): Promise<string> {
  // TODO(KIT-5841): serialize + write the report to disk.
  return Promise.resolve('');
}
