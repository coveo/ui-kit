import {isNonNegativeNumber, isOneOf} from './validation.js';

const CRASH_PHASES = [
  'unknown',
  'input',
  'template-download',
  'project-creation',
  'dependency-installation',
  'complete',
] as const;

export type CrashPhase = (typeof CRASH_PHASES)[number];

const CRASH_PHASE_LABELS: Record<CrashPhase, string> = {
  unknown: 'Scaffold',
  input: 'Resolve inputs',
  'template-download': 'Download template',
  'project-creation': 'Create project',
  'dependency-installation': 'Install dependencies',
  complete: 'Finish',
};

interface CrashSpan {
  op: CrashPhase;
  name: string;
  startedOn: string;
  endedOn: string;
  attributes?: Record<string, string>;
}

interface CrashRuntimeSummary {
  processUptimeMs: number;
}

export interface CrashDiagnostics {
  phase: CrashPhase;
  phaseElapsedMs: number;
  spans: CrashSpan[];
  runtime: CrashRuntimeSummary;
}

interface PhaseSpanState {
  phase: CrashPhase;
  startedAtMs: number;
  name?: string;
  attributes?: Record<string, string>;
}

interface DiagnosticsState {
  phase: CrashPhase;
  phaseStartedAtMs?: number;
  phaseSpans: PhaseSpanState[];
}

let state: DiagnosticsState = {phase: 'unknown', phaseSpans: []};

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((entry) => typeof entry === 'string')
  );
}

function isCrashSpan(value: unknown): value is CrashSpan {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<CrashSpan>;
  return (
    isOneOf(candidate.op, CRASH_PHASES) &&
    typeof candidate.name === 'string' &&
    typeof candidate.startedOn === 'string' &&
    typeof candidate.endedOn === 'string' &&
    (candidate.attributes === undefined || isStringRecord(candidate.attributes))
  );
}

export function isCrashDiagnostics(value: unknown): value is CrashDiagnostics {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<CrashDiagnostics>;
  return (
    isOneOf(candidate.phase, CRASH_PHASES) &&
    isNonNegativeNumber(candidate.phaseElapsedMs) &&
    Array.isArray(candidate.spans) &&
    candidate.spans.every(isCrashSpan) &&
    isNonNegativeNumber(candidate.runtime?.processUptimeMs)
  );
}

export function resetCrashDiagnostics(): void {
  state = {phase: 'unknown', phaseSpans: []};
}

function transitionToCrashPhase(phase: CrashPhase, now: number): void {
  state.phase = phase;
  state.phaseStartedAtMs = now;
  state.phaseSpans.push({phase, startedAtMs: now});
}

export function initializeCrashDiagnostics(): void {
  resetCrashDiagnostics();
  transitionToCrashPhase('input', Date.now());
}

export function startCrashPhase(phase: CrashPhase): void {
  transitionToCrashPhase(phase, Date.now());
}

export function describeActiveCrashSpan(name: string, attributes?: Record<string, string>): void {
  const active = state.phaseSpans.at(-1);
  if (active === undefined) {
    return;
  }
  active.name = name;
  if (attributes !== undefined) {
    active.attributes = attributes;
  }
}

export function snapshotCrashDiagnostics(): CrashDiagnostics {
  const now = Date.now();
  const spans: CrashSpan[] = state.phaseSpans.map((entry, index) => {
    // Each phase ends when the next one begins; the active phase ends now (at
    // the crash / snapshot).
    const endedAtMs =
      index < state.phaseSpans.length - 1 ? state.phaseSpans[index + 1].startedAtMs : now;
    const span: CrashSpan = {
      op: entry.phase,
      name: entry.name ?? CRASH_PHASE_LABELS[entry.phase],
      startedOn: new Date(entry.startedAtMs).toISOString(),
      endedOn: new Date(Math.max(entry.startedAtMs, endedAtMs)).toISOString(),
    };
    if (entry.attributes !== undefined) {
      span.attributes = entry.attributes;
    }
    return span;
  });
  return {
    phase: state.phase,
    phaseElapsedMs:
      state.phaseStartedAtMs === undefined ? 0 : Math.max(0, now - state.phaseStartedAtMs),
    spans,
    runtime: {
      processUptimeMs: Math.max(0, Math.round(process.uptime() * 1000)),
    },
  };
}
