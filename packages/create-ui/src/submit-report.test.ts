import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {homedir, tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {CRASH_REPORT_SCHEMA_VERSION, type CrashReport} from './crash-report.js';

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
  flush: vi.fn(async () => true),
  close: vi.fn(async () => true),
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
  error: {name: 'Error', message: 'boom', stack: 'Error: boom\n    at x'},
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

  it('initializes Sentry with a DSN and privacy options, captures, flushes, closes, and tags the run-id', async () => {
    expect(await submitReport(await writeValidReport())).toBe(0);

    const initOptions = sentry.init.mock.calls[0][0];
    expect(initOptions).toMatchObject({
      defaultIntegrations: false,
      sendDefaultPii: false,
    });
    expect(typeof initOptions.dsn).toBe('string');
    expect(initOptions.dsn.length).toBeGreaterThan(0);
    expect(sentry.captureException).toHaveBeenCalledOnce();
    expect(sentry.captureException.mock.calls[0][1].tags.run_id).toBe(
      'run-xyz'
    );
    expect(sentry.flush).toHaveBeenCalled();
    expect(sentry.close).toHaveBeenCalled();
  });

  it('beforeSend preserves the crash time, strips host/user identity, and scrubs paths', async () => {
    await submitReport(await writeValidReport());

    const home = homedir();
    const processed = sentry.init.mock.calls[0][0].beforeSend({
      server_name: 'secret-hostname',
      user: {id: 'user-123'},
      request: {url: 'https://internal/api'},
      modules: {'private-dep': '1.0.0'},
      breadcrumbs: [{message: 'leaky breadcrumb'}],
      contexts: {device: {name: 'Alice-MacBook'}, os: {name: 'darwin'}},
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
                  vars: {secret: 'super-secret'},
                  context_line: 'const token = "abc123"',
                },
              ],
            },
          },
        ],
      },
    });

    expect(processed.timestamp).toBe(Date.parse(sampleReport.crashedOn) / 1000);
    expect(processed.server_name).toBeUndefined();
    expect(processed.user).toBeUndefined();
    expect(processed.request).toBeUndefined();
    expect(processed.modules).toBeUndefined();
    expect(processed.breadcrumbs).toBeUndefined();
    expect(processed.contexts.device).toBeUndefined();
    expect(processed.contexts.os).toEqual({name: 'darwin'});
    expect(processed.message).toBe('failed at ~/project');
    const frame = processed.exception.values[0].stacktrace.frames[0];
    expect(frame.filename).toBe('~/project/index.js');
    expect(frame.vars).toBeUndefined();
    expect(frame.context_line).toBeUndefined();
  });
});
