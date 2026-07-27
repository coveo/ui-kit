import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  initializeCrashDiagnostics,
  isCrashDiagnostics,
  MAX_CRASH_BREADCRUMBS,
  recordCrashLifecycleEvent,
  resetCrashDiagnostics,
  snapshotCrashDiagnostics,
} from './crash-diagnostics.js';

describe('crash diagnostics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-27T15:00:00.000Z'));
    resetCrashDiagnostics();
  });

  afterEach(() => {
    resetCrashDiagnostics();
    vi.useRealTimers();
  });

  it('captures an allowlisted breadcrumb timeline and current phase timing', () => {
    initializeCrashDiagnostics();
    recordCrashLifecycleEvent('input.resolved');
    vi.advanceTimersByTime(100);
    recordCrashLifecycleEvent('template.download.started');
    vi.advanceTimersByTime(250);
    recordCrashLifecycleEvent('template.download.completed');

    const diagnostics = snapshotCrashDiagnostics();

    expect(diagnostics).toMatchObject({
      phase: 'template-download',
      phaseElapsedMs: 250,
      breadcrumbs: [
        {
          type: 'input.resolved',
          timestamp: '2026-07-27T15:00:00.000Z',
        },
        {
          type: 'template.download.started',
          timestamp: '2026-07-27T15:00:00.100Z',
        },
        {
          type: 'template.download.completed',
          timestamp: '2026-07-27T15:00:00.350Z',
        },
      ],
      runtime: {
        processUptimeMs: expect.any(Number),
        memory: {
          rssBytes: expect.any(Number),
          heapTotalBytes: expect.any(Number),
          heapUsedBytes: expect.any(Number),
          externalBytes: expect.any(Number),
        },
      },
    });
    expect(isCrashDiagnostics(diagnostics)).toBe(true);
  });

  it('keeps only the newest bounded breadcrumbs', () => {
    initializeCrashDiagnostics();
    for (let index = 0; index < MAX_CRASH_BREADCRUMBS + 5; index++) {
      vi.advanceTimersByTime(1);
      recordCrashLifecycleEvent('input.resolved');
    }

    const {breadcrumbs} = snapshotCrashDiagnostics();

    expect(breadcrumbs).toHaveLength(MAX_CRASH_BREADCRUMBS);
    expect(breadcrumbs[0].timestamp).toBe('2026-07-27T15:00:00.006Z');
    expect(breadcrumbs.at(-1)?.timestamp).toBe('2026-07-27T15:00:00.037Z');
  });

  it('returns an unknown zero-duration phase before initialization', () => {
    const diagnostics = snapshotCrashDiagnostics();

    expect(diagnostics.phase).toBe('unknown');
    expect(diagnostics.phaseElapsedMs).toBe(0);
    expect(diagnostics.breadcrumbs).toEqual([]);
    expect(isCrashDiagnostics(diagnostics)).toBe(true);
  });
});
