import {isNonNegativeNumber, isOneOf} from './validation.js';
export const MAX_CRASH_BREADCRUMBS = 32;

const CRASH_PHASES = [
  'unknown',
  'input',
  'template-download',
  'project-creation',
  'dependency-installation',
  'complete',
] as const;

const CRASH_BREADCRUMB_TYPES = [
  'input.resolved',
  'template.download.started',
  'template.download.completed',
  'project.creation.started',
  'project.creation.completed',
  'dependencies.install.started',
  'dependencies.install.succeeded',
  'dependencies.install.failed',
  'scaffold.completed',
] as const;

export type CrashPhase = (typeof CRASH_PHASES)[number];
export type CrashBreadcrumbType = (typeof CRASH_BREADCRUMB_TYPES)[number];

export interface CrashBreadcrumb {
  type: CrashBreadcrumbType;
  timestamp: string;
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
  breadcrumbs: CrashBreadcrumb[];
  runtime: CrashRuntimeSummary;
}

interface DiagnosticsState {
  phase: CrashPhase;
  phaseStartedAtMs?: number;
  breadcrumbs: CrashBreadcrumb[];
}

const PHASE_BY_LIFECYCLE_EVENT: Partial<
  Record<CrashBreadcrumbType, CrashPhase>
> = {
  'template.download.started': 'template-download',
  'project.creation.started': 'project-creation',
  'dependencies.install.started': 'dependency-installation',
  'scaffold.completed': 'complete',
};

let state: DiagnosticsState = {phase: 'unknown', breadcrumbs: []};

function isCrashBreadcrumb(value: unknown): value is CrashBreadcrumb {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<CrashBreadcrumb>;
  return (
    isOneOf(candidate.type, CRASH_BREADCRUMB_TYPES) &&
    typeof candidate.timestamp === 'string'
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
    Array.isArray(candidate.breadcrumbs) &&
    candidate.breadcrumbs.length <= MAX_CRASH_BREADCRUMBS &&
    candidate.breadcrumbs.every(isCrashBreadcrumb) &&
    isNonNegativeNumber(candidate.runtime?.processUptimeMs) &&
    isNonNegativeNumber(memory?.rssBytes) &&
    isNonNegativeNumber(memory?.heapTotalBytes) &&
    isNonNegativeNumber(memory?.heapUsedBytes) &&
    isNonNegativeNumber(memory?.externalBytes)
  );
}

export function resetCrashDiagnostics(): void {
  state = {phase: 'unknown', breadcrumbs: []};
}

function transitionToCrashPhase(phase: CrashPhase, now: number): void {
  state.phase = phase;
  state.phaseStartedAtMs = now;
}

export function initializeCrashDiagnostics(): void {
  resetCrashDiagnostics();
  transitionToCrashPhase('input', Date.now());
}

export function recordCrashLifecycleEvent(type: CrashBreadcrumbType): void {
  const now = Date.now();
  const phase = PHASE_BY_LIFECYCLE_EVENT[type];
  if (phase !== undefined) {
    transitionToCrashPhase(phase, now);
  }
  state.breadcrumbs.push({type, timestamp: new Date(now).toISOString()});
  if (state.breadcrumbs.length > MAX_CRASH_BREADCRUMBS) {
    state.breadcrumbs.splice(
      0,
      state.breadcrumbs.length - MAX_CRASH_BREADCRUMBS
    );
  }
}

export function snapshotCrashDiagnostics(): CrashDiagnostics {
  const now = Date.now();
  const memory = process.memoryUsage();
  return {
    phase: state.phase,
    phaseElapsedMs:
      state.phaseStartedAtMs === undefined
        ? 0
        : Math.max(0, now - state.phaseStartedAtMs),
    breadcrumbs: state.breadcrumbs.map((breadcrumb) => ({...breadcrumb})),
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
