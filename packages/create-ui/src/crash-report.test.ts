import {readFile, rm} from 'node:fs/promises';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  buildCrashReport,
  CRASH_REPORT_SCHEMA_VERSION,
  crashReportPath,
  parseCrashReport,
  redactPaths,
  resetRunContext,
  setRunContext,
  writeCrashReport,
} from './crash-report.js';
import {CrashReportError} from './errors.js';
import type {ProjectMetadata} from './metadata.js';

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
  beforeEach(() => resetRunContext());
  afterEach(() => resetRunContext());

  it('assembles the documented shape, redacting paths and using captured metadata', () => {
    setRunContext({metadata});

    const report = buildCrashReport(
      new Error('failed at /Users/alice/my-app/index.js')
    );

    expect(report.schemaVersion).toBe(CRASH_REPORT_SCHEMA_VERSION);
    expect(report.runId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-/);
    expect(Number.isNaN(Date.parse(report.crashedOn))).toBe(false);
    expect(report.error).toEqual({
      name: 'Error',
      message: 'failed at index.js',
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

describe('redactPaths', () => {
  it('reduces absolute paths and file:// URLs to the file name', () => {
    expect(redactPaths('at /Users/alice/app/index.js:5:1')).toBe(
      'at index.js:5:1'
    );
    expect(redactPaths('at scaffold (file:///Users/alice/dist/s.js:9:2)')).toBe(
      'at scaffold (s.js:9:2)'
    );
  });

  it('reduces Windows paths written with either separator', () => {
    expect(redactPaths('at C:\\Users\\carol\\index.js:5:1')).toBe(
      'at index.js:5:1'
    );
    expect(redactPaths('at C:/Users/carol/index.js:5:1')).toBe(
      'at index.js:5:1'
    );
  });

  it('drops the directory (and the username it embeds) from a path', () => {
    const out = redactPaths("open '/Users/jane.doe/secret/config.json'");
    expect(out).toBe("open 'config.json'");
    expect(out).not.toContain('jane.doe');
  });

  it('leaves node: module ids and http(s) URLs intact', () => {
    expect(redactPaths('at node:internal/modules/esm/module_job:430:25')).toBe(
      'at node:internal/modules/esm/module_job:430:25'
    );
    expect(redactPaths('see https://github.com/coveo/ui-kit/issues')).toBe(
      'see https://github.com/coveo/ui-kit/issues'
    );
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
