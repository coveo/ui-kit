// Crash diagnostics capture.
//
// TODO(KIT-5841): this module is an intentional no-op skeleton. The real
// span-tracking implementation (and its tests) lands in a follow-up PR. The
// signatures below are the final public surface the scaffold flow and CLI wire
// against, so introducing the real behaviour later is a self-contained change.

const CRASH_PHASES = [
  'unknown',
  'input',
  'template-download',
  'project-creation',
  'dependency-installation',
  'complete',
] as const;

export type CrashPhase = (typeof CRASH_PHASES)[number];

/** Resets diagnostics state and opens the initial span. */
export function initializeCrashDiagnostics(): void {
  // TODO(KIT-5841): reset the diagnostics state for a fresh run.
}

/** Closes the active span and opens one for the given phase. */
export function startCrashPhase(_phase: CrashPhase): void {
  // TODO(KIT-5841): record the phase transition as a span.
}

/** Attaches a human-readable name and non-PII attributes to the active span. */
export function describeActiveCrashSpan(_name: string, _attributes?: Record<string, string>): void {
  // TODO(KIT-5841): annotate the active span.
}
