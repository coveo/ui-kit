import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  describeActiveCrashSpan,
  initializeCrashDiagnostics,
  isCrashDiagnostics,
  resetCrashDiagnostics,
  snapshotCrashDiagnostics,
  startCrashPhase,
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

  it('captures a per-phase span timeline and current phase timing', () => {
    initializeCrashDiagnostics();
    vi.advanceTimersByTime(100);
    startCrashPhase('template-download');
    vi.advanceTimersByTime(250);

    const diagnostics = snapshotCrashDiagnostics();

    expect(diagnostics).toMatchObject({
      phase: 'template-download',
      phaseElapsedMs: 250,
      spans: [
        {
          op: 'input',
          name: 'Resolve inputs',
          startedOn: '2026-07-27T15:00:00.000Z',
          endedOn: '2026-07-27T15:00:00.100Z',
        },
        {
          op: 'template-download',
          name: 'Download template',
          startedOn: '2026-07-27T15:00:00.100Z',
          endedOn: '2026-07-27T15:00:00.350Z',
        },
      ],
      runtime: {
        processUptimeMs: expect.any(Number),
      },
    });
    expect(isCrashDiagnostics(diagnostics)).toBe(true);
  });

  it('describes the active span with a name and attributes', () => {
    initializeCrashDiagnostics();
    startCrashPhase('template-download');
    describeActiveCrashSpan('atomic-search@3.60.2', {
      'coveo.template': 'atomic-search',
      'coveo.template_version': '3.60.2',
    });

    const {spans} = snapshotCrashDiagnostics();
    const download = spans.find((span) => span.op === 'template-download');
    const input = spans.find((span) => span.op === 'input');

    expect(download?.name).toBe('atomic-search@3.60.2');
    expect(download?.attributes).toEqual({
      'coveo.template': 'atomic-search',
      'coveo.template_version': '3.60.2',
    });
    // Only the described span is annotated; other spans keep their default phase
    // label and carry no attributes, so the trace projection has nothing to
    // special-case.
    expect(input?.name).toBe('Resolve inputs');
    expect(input?.attributes).toBeUndefined();
  });

  it('returns an unknown zero-duration phase before initialization', () => {
    const diagnostics = snapshotCrashDiagnostics();

    expect(diagnostics.phase).toBe('unknown');
    expect(diagnostics.phaseElapsedMs).toBe(0);
    expect(diagnostics.spans).toEqual([]);
    expect(isCrashDiagnostics(diagnostics)).toBe(true);
  });
});
