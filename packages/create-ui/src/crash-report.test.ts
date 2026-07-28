import {readFile, rm, stat} from 'node:fs/promises';
import {homedir} from 'node:os';
import {dirname, join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {
  initializeCrashDiagnostics,
  recordCrashLifecycleEvent,
  resetCrashDiagnostics,
} from './crash-diagnostics.js';
import {
  buildCrashReport,
  CRASH_REPORT_SCHEMA_VERSION,
  type CrashErrorInfo,
  crashReportPath,
  crashReportReference,
  MAX_CAUSE_DEPTH,
  parseCrashReport,
  redactPaths,
  resetRunContext,
  resolveCrashReportPath,
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
  beforeEach(() => {
    resetRunContext();
    resetCrashDiagnostics();
  });
  afterEach(() => {
    resetRunContext();
    resetCrashDiagnostics();
  });

  it('assembles the documented shape, redacting paths and using captured metadata', () => {
    setRunContext({metadata});

    const report = buildCrashReport(new Error(`failed at ${homedir()}/my-app/index.js`));

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
    expect(report.origin).toBe('unknown');
    expect(report.diagnostics).toMatchObject({
      phase: 'unknown',
      phaseElapsedMs: 0,
      breadcrumbs: [],
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
  });

  it('captures the crash origin and current structured diagnostics', () => {
    initializeCrashDiagnostics();
    recordCrashLifecycleEvent('input.resolved');
    recordCrashLifecycleEvent('template.download.started');

    const report = buildCrashReport(new Error('boom'), 'unhandled-rejection');

    expect(report.origin).toBe('unhandled-rejection');
    expect(report.diagnostics.phase).toBe('template-download');
    expect(report.diagnostics.breadcrumbs.map(({type}) => type)).toEqual([
      'input.resolved',
      'template.download.started',
    ]);
  });

  it('normalizes own-package stack paths before writing a report', () => {
    const home = homedir();
    const encodedHome = home.replace(/^[/\\]+/, '').replace(/[/\\]/g, '+');
    const error = new Error('boom');
    error.stack = [
      'Error: boom',
      `    at scaffold (file:///private/tmp/test-create-ui/node_modules/.pnpm/@coveo+create-ui@file+..+..+..+${encodedHome}+Developer+ui-kit_123/node_modules/@coveo/create-ui/dist/scaffold.js:77:15)`,
      `    at dependency (${home}/project/node_modules/pacote/lib/fetch.js:9:2)`,
      '    at async file:///private/tmp/test-create-ui/node_modules/@coveo/create-ui/dist/index.js:12:3',
    ].join('\n');

    const stack = buildCrashReport(error).error.stack;

    expect(stack).toBe(
      [
        'Error: boom',
        '    at scaffold (app:///dist/scaffold.js:77:15)',
        '    at dependency (~/project/node_modules/pacote/lib/fetch.js:9:2)',
        '    at async app:///dist/index.js:12:3',
      ].join('\n')
    );
    expect(stack).not.toContain('+..+..+..+');
    expect(stack).not.toContain(encodedHome);
    expect(stack).not.toContain('node_modules/@coveo/create-ui');
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

  it('captures a scrubbed cause chain (Error and non-Error links)', () => {
    setRunContext({metadata});
    const home = homedir();

    const report = buildCrashReport(
      new Error(`top failed at ${home}/app/a.js`, {
        cause: new Error(`db failed at ${home}/app/b.js`, {
          cause: 'root string cause',
        }),
      })
    );

    expect(report.error.message).toBe('top failed at ~/app/a.js');
    expect(report.error.cause).toEqual({
      name: 'Error',
      message: 'db failed at ~/app/b.js',
      stack: expect.any(String),
      cause: {name: 'NonError', message: 'root string cause'},
    });
  });

  it('bounds the cause chain at MAX_CAUSE_DEPTH links', () => {
    setRunContext({metadata});

    let error = new Error('root');
    for (let i = 0; i < MAX_CAUSE_DEPTH + 3; i++) {
      error = new Error(`level ${i}`, {cause: error});
    }
    const report = buildCrashReport(error);

    let depth = 0;
    let node: CrashErrorInfo | undefined = report.error.cause;
    while (node !== undefined) {
      depth++;
      node = node.cause;
    }
    expect(depth).toBe(MAX_CAUSE_DEPTH);
  });

  it('stops at a circular cause instead of looping forever', () => {
    setRunContext({metadata});

    const a = new Error('a');
    const b = new Error('b', {cause: a});
    (a as Error & {cause?: unknown}).cause = b;

    const report = buildCrashReport(a);

    expect(report.error.message).toBe('a');
    expect(report.error.cause?.message).toBe('b');
    expect(report.error.cause?.cause).toBeUndefined();
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

  it('derives a short reference that resolves within the temp directory', () => {
    const runId = 'c5c41c93-a851-4421-b27a-c8949d56dcaa';
    const reference = crashReportReference(runId);

    expect(reference).toBe('c5c41c93a851');
    expect(resolveCrashReportPath(reference)).toBe(crashReportPath(runId));
    expect(resolveCrashReportPath(reference.toUpperCase())).toBe(crashReportPath(runId));
    expect(resolveCrashReportPath('/tmp/existing-report.json')).toBe('/tmp/existing-report.json');
  });

  it('writes pretty-printed JSON to a short-reference file in tmpdir', async () => {
    const report = buildCrashReport(new Error('boom'));
    const path = await writeCrashReport(report);
    try {
      expect(path).toBe(crashReportPath(report.runId));
      expect(dirname(path)).toContain(join('@coveo', 'create-ui', 'crash-reports'));
      const written = await readFile(path, 'utf8');
      expect(JSON.parse(written)).toEqual(report);
      expect(written.endsWith('\n')).toBe(true);
      if (process.platform !== 'win32') {
        expect((await stat(path)).mode & 0o777).toBe(0o600);
      }
    } finally {
      await rm(path, {force: true});
    }
  });
});

describe('redactPaths', () => {
  it('replaces the home directory with ~ and keeps the rest of the path', () => {
    expect(redactPaths('at /Users/alice/app/index.js:5:1', '/Users/alice')).toBe(
      'at ~/app/index.js:5:1'
    );
    expect(redactPaths('at scaffold (file:///Users/alice/dist/s.js:9:2)', '/Users/alice')).toBe(
      'at scaffold (file://~/dist/s.js:9:2)'
    );
  });

  it('preserves the node_modules structure below home', () => {
    expect(redactPaths('/Users/alice/proj/node_modules/pacote/lib/fetch.js', '/Users/alice')).toBe(
      '~/proj/node_modules/pacote/lib/fetch.js'
    );
  });

  it('replaces a Windows home dir written with either separator', () => {
    expect(redactPaths('at C:\\Users\\carol\\app\\index.js:5:1', 'C:\\Users\\carol')).toBe(
      'at ~\\app\\index.js:5:1'
    );
    expect(redactPaths('at C:/Users/carol/app/index.js:5:1', 'C:\\Users\\carol')).toBe(
      'at ~/app/index.js:5:1'
    );
  });

  it('removes the username embedded in the home path', () => {
    const out = redactPaths("open '/Users/jane.doe/secret/config.json'", '/Users/jane.doe');
    expect(out).toBe("open '~/secret/config.json'");
    expect(out).not.toContain('jane.doe');
  });

  it('leaves node: module ids and http(s) URLs intact', () => {
    expect(redactPaths('at node:internal/modules/esm/module_job:430:25', '/Users/alice')).toBe(
      'at node:internal/modules/esm/module_job:430:25'
    );
    expect(redactPaths('see https://github.com/coveo/ui-kit/issues', '/Users/alice')).toBe(
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

  it('migrates persisted v1 into the canonical model', () => {
    const report = buildCrashReport(new Error('boom'));
    const persistedV1 = {...report, removedByMigration: true};

    expect(parseCrashReport(JSON.stringify(persistedV1))).toEqual(report);
  });

  it('rejects a malformed report through its known-version migrator', () => {
    expect(() => parseCrashReport(JSON.stringify({schemaVersion: 1}))).toThrowError(
      expect.objectContaining({kind: 'not-a-report'})
    );

    const malformedError = {...buildCrashReport(new Error('boom')), error: {}};
    expect(() => parseCrashReport(JSON.stringify(malformedError))).toThrowError(
      expect.objectContaining({kind: 'not-a-report'})
    );
  });

  it('throws not-a-report for input that is not a crash report', () => {
    expect(() => parseCrashReport('{not json')).toThrowError(
      expect.objectContaining({kind: 'not-a-report'})
    );
    expect(() => parseCrashReport(JSON.stringify({hello: 'world'}))).toThrowError(
      expect.objectContaining({kind: 'not-a-report'})
    );
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
