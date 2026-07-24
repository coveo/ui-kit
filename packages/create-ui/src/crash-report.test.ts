import {readFile, rm} from 'node:fs/promises';
import {homedir} from 'node:os';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  buildCrashReport,
  CRASH_REPORT_SCHEMA_VERSION,
  crashReportPath,
  parseCrashReport,
  resetRunContext,
  scrub,
  setRunContext,
  writeCrashReport,
} from './crash-report.js';
import {CrashReportError} from './errors.js';
import type {ProjectMetadata} from './metadata.js';

// scrub and the OS block read the real environment; pin the home dir so
// path assertions are deterministic across machines. tmpdir stays real.
vi.mock('node:os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:os')>();
  return {...actual, homedir: vi.fn(() => '/Users/alice')};
});

const metadata: ProjectMetadata = {
  template: 'headless-search-react',
  templateVersion: '3.5.0',
  createdWith: 'create-ui@1.2.3',
  createdOn: '2026-07-22T14:59:00.000Z',
  dependencies: {'@coveo/headless': '4.1.0'},
  node: '22.12.0',
  packageManager: 'pnpm',
};

describe('buildCrashReport', () => {
  beforeEach(() => {
    resetRunContext();
    vi.mocked(homedir).mockReturnValue('/Users/alice');
  });
  afterEach(() => {
    resetRunContext();
  });

  it('assembles the documented shape, scrubbing the home dir and using captured metadata', () => {
    setRunContext({metadata});

    const report = buildCrashReport(
      new Error('failed at /Users/alice/my-app/index.js')
    );

    expect(report.schemaVersion).toBe(CRASH_REPORT_SCHEMA_VERSION);
    expect(report.runId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/);
    expect(Number.isNaN(Date.parse(report.crashedOn))).toBe(false);
    expect(report.error).toEqual({
      name: 'Error',
      message: 'failed at ~/my-app/index.js',
      stack: expect.any(String),
    });
    expect(report.os).toEqual({
      platform: expect.any(String),
      arch: expect.any(String),
      release: expect.any(String),
    });
    expect(report.metadata).toEqual(metadata);
  });

  it('prefers captured metadata over runtime-derived fields', () => {
    setRunContext({template: 'atomic-search', templateVersion: '', metadata});

    expect(buildCrashReport(new Error('boom')).metadata).toEqual(metadata);
  });

  it('handles a non-Error thrown value', () => {
    const report = buildCrashReport('a string failure');
    expect(report.error).toEqual({
      name: 'NonError',
      message: 'a string failure',
    });
  });

  it('derives metadata from runtime state when none was captured', () => {
    setRunContext({template: 'atomic-search', templateVersion: '3.2.1'});

    const report = buildCrashReport(new Error('boom'));

    expect(report.metadata.template).toBe('atomic-search');
    expect(report.metadata.templateVersion).toBe('3.2.1');
    expect(report.metadata.dependencies).toEqual({});
    expect(report.metadata.createdWith).toMatch(/^create-ui@/);
  });
});

describe('writeCrashReport', () => {
  beforeEach(() => resetRunContext());
  afterEach(() => resetRunContext());

  it('writes pretty-printed JSON to a run-id-named file in tmpdir', async () => {
    const report = buildCrashReport(new Error('boom'));
    const path = await writeCrashReport(report);
    try {
      expect(path).toBe(crashReportPath(report.runId));
      const written = await readFile(path, 'utf8');
      expect(JSON.parse(written)).toEqual(report);
      expect(written.endsWith('\n')).toBe(true);
    } finally {
      await rm(path, {force: true});
    }
  });
});

describe('scrub', () => {
  it('replaces the POSIX home directory with ~', () => {
    vi.mocked(homedir).mockReturnValue('/Users/alice');
    expect(scrub('at /Users/alice/app and /Users/alice/x')).toBe(
      'at ~/app and ~/x'
    );
  });

  it('replaces a Windows home directory written with either separator', () => {
    vi.mocked(homedir).mockReturnValue('C:\\Users\\carol');
    expect(scrub('at C:\\Users\\carol\\app')).toBe('at ~\\app');
    expect(scrub('at C:/Users/carol/app')).toBe('at ~/app');
  });
});

describe('parseCrashReport', () => {
  beforeEach(() => resetRunContext());

  it('round-trips a report written by the capture side', () => {
    const report = buildCrashReport(new Error('boom'));
    expect(parseCrashReport(JSON.stringify(report))).toEqual(report);
  });

  it('throws not-a-report for input that is not a crash report', () => {
    expect(() => parseCrashReport('{not json')).toThrowError(
      expect.objectContaining({kind: 'not-a-report'})
    );
    expect(() =>
      parseCrashReport(JSON.stringify({hello: 'world'}))
    ).toThrowError(expect.objectContaining({kind: 'not-a-report'}));
  });

  it('throws version-mismatch carrying the report version', () => {
    const future = {
      schemaVersion: 99,
      runId: 'r',
      crashedOn: '2026-07-22T15:00:00.000Z',
      error: {name: 'Error', message: 'x'},
      os: {platform: 'darwin', arch: 'arm64', release: '24.0.0'},
      metadata,
    };
    let caught: unknown;
    try {
      parseCrashReport(JSON.stringify(future));
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(CrashReportError);
    expect((caught as CrashReportError).kind).toBe('version-mismatch');
    expect((caught as CrashReportError).reportVersion).toBe(99);
  });
});
