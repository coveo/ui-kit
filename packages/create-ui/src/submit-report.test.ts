import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {homedir, tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  CRASH_REPORT_SCHEMA_VERSION,
  crashReportReference,
  MAX_CAUSE_DEPTH,
  type CrashReport,
  writeCrashReport,
} from './crash-report.js';

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
  flush: vi.fn(async () => true),
  close: vi.fn(async () => true),
  linkedErrorsIntegration: vi.fn((options?: {limit?: number}) => ({
    name: 'LinkedErrors',
    ...options,
  })),
}));

vi.mock('@sentry/node', () => sentry);
vi.mock('./log.js', () => ({
  log: {
    info: vi.fn(),
    step: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    note: vi.fn(),
  },
}));

const {submitReport} = await import('./submit-report.js');

const sampleReport: CrashReport = {
  schemaVersion: CRASH_REPORT_SCHEMA_VERSION,
  runId: 'run-xyz',
  crashedOn: '2026-07-22T15:00:00.000Z',
  origin: 'main-rejection',
  error: {name: 'Error', message: 'boom', stack: 'Error: boom\n    at x'},
  diagnostics: {
    phase: 'dependency-installation',
    phaseElapsedMs: 2000,
    breadcrumbs: [
      {type: 'input.resolved', timestamp: '2026-07-22T14:59:00.000Z'},
      {
        type: 'dependencies.install.started',
        timestamp: '2026-07-22T14:59:58.000Z',
      },
    ],
    runtime: {
      processUptimeMs: 3100,
      memory: {
        rssBytes: 1000,
        heapTotalBytes: 800,
        heapUsedBytes: 600,
        externalBytes: 50,
      },
    },
  },
  os: {platform: 'darwin', arch: 'arm64', release: '24.0.0'},
  metadata: {
    template: 'headless-search-react',
    templateVersion: '3.5.0',
    createdWith: 'create-ui@1.2.3',
    createdOn: '2026-07-22T14:59:00.000Z',
    dependencies: {'@coveo/headless': '4.1.0'},
    node: '22.12.0',
    packageManager: 'pnpm',
  },
};

describe('submitReport', () => {
  let dir: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    sentry.flush.mockResolvedValue(true);
    sentry.close.mockResolvedValue(true);
    dir = await mkdtemp(join(tmpdir(), 'create-ui-report-test-'));
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(dir, {recursive: true, force: true});
  });

  async function writeValidReport(): Promise<string> {
    const path = join(dir, 'report.json');
    await writeFile(path, JSON.stringify(sampleReport));
    return path;
  }

  it('returns 1 and does not init Sentry for a missing path', async () => {
    expect(await submitReport(undefined)).toBe(1);
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it('refuses to send when DO_NOT_TRACK is set', async () => {
    vi.stubEnv('DO_NOT_TRACK', '1');
    expect(await submitReport(await writeValidReport())).toBe(0);
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it('returns 1 for a file that is not a valid crash report', async () => {
    const bad = join(dir, 'bad.json');
    await writeFile(bad, JSON.stringify({not: 'a report'}));
    expect(await submitReport(bad)).toBe(1);
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it('submits a temp report by its short reference', async () => {
    const report = {
      ...sampleReport,
      runId: 'c5c41c93-a851-4421-b27a-c8949d56dcaa',
    };
    const path = await writeCrashReport(report);
    try {
      expect(await submitReport(crashReportReference(report.runId))).toBe(0);
      expect(sentry.captureException).toHaveBeenCalledOnce();
    } finally {
      await rm(path, {force: true});
    }
  });

  it('initializes Sentry with a DSN and privacy options, captures, flushes, closes, and tags the run-id', async () => {
    expect(await submitReport(await writeValidReport())).toBe(0);

    const initOptions = sentry.init.mock.calls[0][0];
    expect(initOptions).toMatchObject({
      release: 'create-ui@1.2.3',
      defaultIntegrations: false,
      sendDefaultPii: false,
      includeServerName: false,
    });
    expect(typeof initOptions.dsn).toBe('string');
    expect(initOptions.dsn.length).toBeGreaterThan(0);
    expect(sentry.linkedErrorsIntegration).toHaveBeenCalledWith({
      limit: MAX_CAUSE_DEPTH,
    });
    expect(initOptions.integrations).toEqual([expect.objectContaining({name: 'LinkedErrors'})]);
    expect(sentry.captureException).toHaveBeenCalledOnce();
    expect(sentry.captureException.mock.calls[0][1].tags.run_id).toBe('run-xyz');
    expect(sentry.captureException.mock.calls[0][1]).toMatchObject({
      tags: {crash_origin: 'main-rejection'},
      contexts: {
        create_ui: {
          phase: 'dependency-installation',
          phase_elapsed_ms: 2000,
          process_uptime_ms: 3100,
          memory_rss_bytes: 1000,
          memory_heap_total_bytes: 800,
          memory_heap_used_bytes: 600,
          memory_external_bytes: 50,
        },
      },
    });
    expect(sentry.flush).toHaveBeenCalled();
    expect(sentry.close).toHaveBeenCalled();
  });

  it('beforeSend preserves the crash time and redacts the home directory to ~', async () => {
    await submitReport(await writeValidReport());
    const home = homedir();

    const processed = sentry.init.mock.calls[0][0].beforeSend({
      message: `failed at ${home}/project`,
      exception: {
        values: [
          {
            value: `boom at ${home}/project`,
            stacktrace: {
              frames: [
                {
                  filename: `${home}/project/index.js`,
                  abs_path: `${home}/project/index.js`,
                },
              ],
            },
          },
        ],
      },
    });

    expect(processed.timestamp).toBe(Date.parse(sampleReport.crashedOn) / 1000);
    expect(processed.breadcrumbs).toEqual([
      {
        category: 'create-ui.lifecycle',
        message: 'input.resolved',
        level: 'info',
        timestamp: Date.parse('2026-07-22T14:59:00.000Z') / 1000,
      },
      {
        category: 'create-ui.lifecycle',
        message: 'dependencies.install.started',
        level: 'info',
        timestamp: Date.parse('2026-07-22T14:59:58.000Z') / 1000,
      },
    ]);
    expect(processed.exception.values[0].mechanism).toEqual({
      type: 'main-rejection',
      handled: false,
    });
    expect(processed.message).toBe('failed at ~/project');
    const frame = processed.exception.values[0].stacktrace.frames[0];
    expect(frame.filename).toBe('~/project/index.js');
    expect(frame.abs_path).toBe('~/project/index.js');
  });

  it('reconstructs the error cause chain as linked errors for capture', async () => {
    const reportWithCause: CrashReport = {
      ...sampleReport,
      error: {
        name: 'Error',
        message: 'boom',
        stack: 'Error: boom\n    at x',
        cause: {
          name: 'TypeError',
          message: 'root cause',
          stack: 'TypeError: root cause\n    at y',
        },
      },
    };
    const path = join(dir, 'with-cause.json');
    await writeFile(path, JSON.stringify(reportWithCause));

    expect(await submitReport(path)).toBe(0);

    const captured = sentry.captureException.mock.calls[0][0] as Error & {
      cause?: Error;
    };
    expect(captured.message).toBe('boom');
    expect(captured.cause).toBeInstanceOf(Error);
    expect(captured.cause?.name).toBe('TypeError');
    expect(captured.cause?.message).toBe('root cause');
  });

  it('beforeSend scrubs every exception value, including linked causes', async () => {
    await submitReport(await writeValidReport());
    const home = homedir();

    const processed = sentry.init.mock.calls[0][0].beforeSend({
      exception: {
        values: [
          {
            value: `ENOENT: open ${home}/project/.env`,
            stacktrace: {
              frames: [
                {
                  filename: `${home}/project/db.js`,
                  abs_path: `${home}/project/db.js`,
                },
              ],
            },
          },
          {
            value: `boom at ${home}/project/index.js`,
            stacktrace: {frames: [{filename: `${home}/project/index.js`}]},
          },
        ],
      },
    });

    const [cause, top] = processed.exception.values;
    expect(cause.value).toBe('ENOENT: open ~/project/.env');
    expect(cause.stacktrace.frames[0].filename).toBe('~/project/db.js');
    expect(cause.stacktrace.frames[0].abs_path).toBe('~/project/db.js');
    expect(top.value).toBe('boom at ~/project/index.js');
    expect(top.stacktrace.frames[0].filename).toBe('~/project/index.js');
  });

  it('rewrites own-package frames to app:/// and strips the install path, including any username', async () => {
    await submitReport(await writeValidReport());

    const ownPath =
      '/private/tmp/app/node_modules/.pnpm/@coveo+create-ui@file+..+..+..+Users+jane.doe+dev+ui-kit_04567/node_modules/@coveo/create-ui/dist/scaffold.js';
    const processed = sentry.init.mock.calls[0][0].beforeSend({
      exception: {
        values: [
          {
            stacktrace: {
              frames: [{filename: ownPath, abs_path: ownPath, module: 'scaffold'}],
            },
          },
        ],
      },
    });

    const frame = processed.exception.values[0].stacktrace.frames[0];
    expect(frame.filename).toBe('app:///dist/scaffold.js');
    expect(frame.abs_path).toBe('app:///dist/scaffold.js');
    expect(frame.in_app).toBe(true);
    expect(frame.module).toBeUndefined();
    expect(JSON.stringify(frame)).not.toContain('jane.doe');
    expect(JSON.stringify(frame)).not.toContain('node_modules');
  });

  it('rewrites an own-package frame that only carries abs_path', async () => {
    await submitReport(await writeValidReport());

    const processed = sentry.init.mock.calls[0][0].beforeSend({
      exception: {
        values: [
          {
            stacktrace: {
              frames: [
                {
                  abs_path: '/tmp/app/node_modules/@coveo/create-ui/dist/index.js',
                },
              ],
            },
          },
        ],
      },
    });

    const frame = processed.exception.values[0].stacktrace.frames[0];
    expect(frame.abs_path).toBe('app:///dist/index.js');
    expect(frame.filename).toBe('app:///dist/index.js');
    expect(frame.in_app).toBe(true);
  });

  it('keeps node internals and dependencies out of app, local source in, and redacts home', async () => {
    await submitReport(await writeValidReport());
    const home = homedir();

    const processed = sentry.init.mock.calls[0][0].beforeSend({
      exception: {
        values: [
          {
            stacktrace: {
              frames: [
                {filename: 'node:internal/process/task_queues'},
                {
                  filename: `${home}/.npm/_npx/ab12/node_modules/pacote/lib/fetch.js`,
                  abs_path: `${home}/.npm/_npx/ab12/node_modules/pacote/lib/fetch.js`,
                },
                {
                  filename: `${home}/dev/ui-kit/packages/create-ui/dist/index.js`,
                  abs_path: `${home}/dev/ui-kit/packages/create-ui/dist/index.js`,
                },
              ],
            },
          },
        ],
      },
    });

    const [nodeFrame, depFrame, localFrame] = processed.exception.values[0].stacktrace.frames;
    expect(nodeFrame.in_app).toBe(false);
    expect(depFrame.in_app).toBe(false);
    expect(depFrame.filename).toBe('~/.npm/_npx/ab12/node_modules/pacote/lib/fetch.js');
    expect(depFrame.abs_path).toBe('~/.npm/_npx/ab12/node_modules/pacote/lib/fetch.js');
    expect(localFrame.in_app).toBe(true);
    expect(localFrame.filename).toBe('~/dev/ui-kit/packages/create-ui/dist/index.js');
  });

  it('defaults the Sentry environment to production', async () => {
    await submitReport(await writeValidReport());
    expect(sentry.init.mock.calls[0][0].environment).toBe('production');
  });

  it('honors the SENTRY_ENVIRONMENT override', async () => {
    vi.stubEnv('SENTRY_ENVIRONMENT', 'development');
    await submitReport(await writeValidReport());
    expect(sentry.init.mock.calls[0][0].environment).toBe('development');
  });
});
