import {isNonNegativeNumber, isOneOf} from './validation.js';

export const MAX_CRASH_SPANS = 16;

const CRASH_PHASES = [
  'unknown',
  'input',
  'template-download',
  'project-creation',
  'dependency-installation',
  'complete',
] as const;

export type CrashPhase = (typeof CRASH_PHASES)[number];

export interface CrashSpan {
  op: CrashPhase;
  startedOn: string;
  endedOn: string;
}

export interface CrashMemorySummary {
  rssBytes: number;
  heapTotalBytes: number;
  heapUsedBytes: number;
  externalBytes: number;
}

export interface CrashRuntimeSummary {
  processUptimeMs: number;
  memory: CrashMemorySummary;
}

export interface CrashDiagnostics {
  phase: CrashPhase;
  phaseElapsedMs: number;
  spans: CrashSpan[];
  runtime: CrashRuntimeSummary;
}

interface DiagnosticsState {
  phase: CrashPhase;
  phaseStartedAtMs?: number;
  phaseSpans: {phase: CrashPhase; startedAtMs: number}[];
}

let state: DiagnosticsState = {phase: 'unknown', phaseSpans: []};

function isCrashSpan(value: unknown): value is CrashSpan {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<CrashSpan>;
  return (
    isOneOf(candidate.op, CRASH_PHASES) &&
    typeof candidate.startedOn === 'string' &&
    typeof candidate.endedOn === 'string'
  );
}

export function isCrashDiagnostics(value: unknown): value is CrashDiagnostics {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<CrashDiagnostics>;
  const memory = candidate.runtime?.memory;
  return (
    isOneOf(candidate.phase, CRASH_PHASES) &&
    isNonNegativeNumber(candidate.phaseElapsedMs) &&
    Array.isArray(candidate.spans) &&
    candidate.spans.length <= MAX_CRASH_SPANS &&
    candidate.spans.every(isCrashSpan) &&
    isNonNegativeNumber(candidate.runtime?.processUptimeMs) &&
    isNonNegativeNumber(memory?.rssBytes) &&
    isNonNegativeNumber(memory?.heapTotalBytes) &&
    isNonNegativeNumber(memory?.heapUsedBytes) &&
    isNonNegativeNumber(memory?.externalBytes)
  );
}

export function resetCrashDiagnostics(): void {
  state = {phase: 'unknown', phaseSpans: []};
}

function transitionToCrashPhase(phase: CrashPhase, now: number): void {
  state.phase = phase;
  state.phaseStartedAtMs = now;
  state.phaseSpans.push({phase, startedAtMs: now});
  if (state.phaseSpans.length > MAX_CRASH_SPANS) {
    state.phaseSpans.splice(0, state.phaseSpans.length - MAX_CRASH_SPANS);
  }
}

export function initializeCrashDiagnostics(): void {
  resetCrashDiagnostics();
  transitionToCrashPhase('input', Date.now());
}

export function startCrashPhase(phase: CrashPhase): void {
  transitionToCrashPhase(phase, Date.now());
}

export function snapshotCrashDiagnostics(): CrashDiagnostics {
  const now = Date.now();
  const memory = process.memoryUsage();
  const spans: CrashSpan[] = state.phaseSpans.map((entry, index) => {
    // Each phase ends when the next one begins; the active phase ends now (at
    // the crash / snapshot).
    const endedAtMs =
      index < state.phaseSpans.length - 1 ? state.phaseSpans[index + 1].startedAtMs : now;
    return {
      op: entry.phase,
      startedOn: new Date(entry.startedAtMs).toISOString(),
      endedOn: new Date(Math.max(entry.startedAtMs, endedAtMs)).toISOString(),
    };
  });
  return {
    phase: state.phase,
    phaseElapsedMs:
      state.phaseStartedAtMs === undefined ? 0 : Math.max(0, now - state.phaseStartedAtMs),
    spans,
    runtime: {
      processUptimeMs: Math.max(0, Math.round(process.uptime() * 1000)),
      memory: {
        rssBytes: memory.rss,
        heapTotalBytes: memory.heapTotal,
        heapUsedBytes: memory.heapUsed,
        externalBytes: memory.external,
      },
    },
  };
}
