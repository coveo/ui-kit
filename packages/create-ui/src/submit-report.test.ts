import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {homedir, tmpdir} from 'node:os';
import {join} from 'node:path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {crashReportReference, MAX_CAUSE_DEPTH, writeCrashReport} from './crash-report.js';
import {createCrashReport} from './test-support.js';

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
  flush: vi.fn(async () => true),
  close: vi.fn(async () => true),
  linkedErrorsIntegration: vi.fn((options?: {limit?: number}) => ({
    name: 'LinkedErrors',
    ...options,
  })),
  startSpanManual: vi.fn((_options: unknown, callback: (span: {end: () => void}) => unknown) =>
    callback({end: vi.fn()})
  ),
  startInactiveSpan: vi.fn(() => ({end: vi.fn()})),
}));

vi.mock('@sentry/node', () => sentry);
vi.mock('./log.js', async () => ({log: (await import('./test-support.js')).createLogMock()}));

const {submitReport} = await import('./submit-report.js');

describe('submitReport', () => {
  let dir: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    dir = await mkdtemp(join(tmpdir(), 'create-ui-report-test-'));
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    await rm(dir, {recursive: true, force: true});
  });

  async function writeReport(overrides?: Parameters<typeof createCrashReport>[0]): Promise<string> {
    const path = join(dir, 'report.json');
    await writeFile(path, JSON.stringify(createCrashReport(overrides)));
    return path;
  }

  const initOptions = () => sentry.init.mock.calls[0][0];

  it('returns 1 without initializing Sentry for a missing path or an invalid report', async () => {
    expect(await submitReport(undefined)).toBe(1);
    const bad = join(dir, 'bad.json');
    await writeFile(bad, JSON.stringify({not: 'a report'}));
    expect(await submitReport(bad)).toBe(1);
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it('returns 0 without sending when DO_NOT_TRACK is set', async () => {
    vi.stubEnv('DO_NOT_TRACK', '1');
    expect(await submitReport(await writeReport())).toBe(0);
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it('initializes Sentry with the release, privacy options, and only the linked-errors integration', async () => {
    expect(await submitReport(await writeReport())).toBe(0);

    expect(initOptions()).toMatchObject({
      release: 'create-ui@1.2.3',
      environment: 'production',
      defaultIntegrations: false,
      sendDefaultPii: false,
      includeServerName: false,
      tracesSampleRate: 1,
    });
    expect(initOptions().dsn.length).toBeGreaterThan(0);
    expect(sentry.linkedErrorsIntegration).toHaveBeenCalledWith({limit: MAX_CAUSE_DEPTH});
    expect(initOptions().integrations).toEqual([expect.objectContaining({name: 'LinkedErrors'})]);
  });

  it('honors the SENTRY_ENVIRONMENT override', async () => {
    vi.stubEnv('SENTRY_ENVIRONMENT', 'development');
    await submitReport(await writeReport());
    expect(initOptions().environment).toBe('development');
  });

  it('replays the phase spans as a transaction, captures the crash once, then flushes and closes', async () => {
    expect(await submitReport(await writeReport())).toBe(0);

    expect(sentry.startSpanManual).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'create headless-search-react',
        op: 'create-ui',
        forceTransaction: true,
      }),
      expect.any(Function)
    );
    const ops = sentry.startInactiveSpan.mock.calls.map(
      ([options]) => (options as {op: string}).op
    );
    expect(ops).toEqual(expect.arrayContaining(['input.resolve', 'dependencies.install']));
    expect(sentry.captureException).toHaveBeenCalledOnce();
    expect(sentry.flush).toHaveBeenCalled();
    expect(sentry.close).toHaveBeenCalled();
  });

  it('captures a plain exception when no spans were recorded', async () => {
    expect(await submitReport(await writeReport({diagnostics: {spans: []}}))).toBe(0);
    expect(sentry.startSpanManual).not.toHaveBeenCalled();
    expect(sentry.captureException).toHaveBeenCalledOnce();
  });

  it('submits a temp report by its short reference', async () => {
    const report = createCrashReport();
    const path = await writeCrashReport(report);
    try {
      expect(await submitReport(crashReportReference(report.runId))).toBe(0);
      expect(sentry.captureException).toHaveBeenCalledOnce();
    } finally {
      await rm(path, {force: true});
    }
  });

  it('reconstructs the error cause chain as linked errors for capture', async () => {
    const path = await writeReport({
      error: {
        name: 'Error',
        message: 'boom',
        cause: {name: 'TypeError', message: 'root cause'},
      },
    });
    expect(await submitReport(path)).toBe(0);

    const captured = sentry.captureException.mock.calls[0][0] as Error & {cause?: Error};
    expect(captured.message).toBe('boom');
    expect(captured.cause).toBeInstanceOf(Error);
    expect(captured.cause?.name).toBe('TypeError');
    expect(captured.cause?.message).toBe('root cause');
  });

  describe('beforeSend', () => {
    async function getBeforeSend(): Promise<(event: any) => any> {
      await submitReport(await writeReport());
      return initOptions().beforeSend;
    }

    it('sets the crash time and mechanism and redacts the home directory from messages and every exception value', async () => {
      const home = homedir();
      const processed = (await getBeforeSend())({
        message: `failed at ${home}/project`,
        exception: {
          values: [
            {
              value: `ENOENT: open ${home}/project/.env`,
              stacktrace: {frames: [{filename: `${home}/project/db.js`}]},
            },
            {
              value: `boom at ${home}/project/index.js`,
              stacktrace: {frames: [{filename: `${home}/project/index.js`}]},
            },
          ],
        },
      });

      expect(processed.timestamp).toBe(Date.parse('2026-07-22T15:00:00.000Z') / 1000);
      expect(processed.transaction).toBe('create headless-search-react');
      expect(processed.breadcrumbs).toBeUndefined();
      expect(processed.message).toBe('failed at ~/project');
      const [cause, top] = processed.exception.values;
      expect(top.mechanism).toEqual({type: 'main-rejection', handled: false});
      expect(cause.value).toBe('ENOENT: open ~/project/.env');
      expect(cause.stacktrace.frames[0].filename).toBe('~/project/db.js');
      expect(top.value).toBe('boom at ~/project/index.js');
      expect(top.stacktrace.frames[0].filename).toBe('~/project/index.js');
    });

    it('classifies frames: own package → app:/// (install path + username stripped), deps/node out of app, local in-app', async () => {
      const home = homedir();
      const ownFull =
        '/tmp/app/node_modules/.pnpm/@coveo+create-ui@file+..+Users+jane.doe+ui-kit_045/node_modules/@coveo/create-ui/dist/scaffold.js';
      const processed = (await getBeforeSend())({
        exception: {
          values: [
            {
              stacktrace: {
                frames: [
                  {filename: 'node:internal/process/task_queues'},
                  {
                    filename: `${home}/.npm/_npx/ab/node_modules/pacote/lib/fetch.js`,
                    abs_path: `${home}/.npm/_npx/ab/node_modules/pacote/lib/fetch.js`,
                  },
                  {
                    filename: `${home}/dev/ui-kit/packages/create-ui/dist/index.js`,
                    abs_path: `${home}/dev/ui-kit/packages/create-ui/dist/index.js`,
                  },
                  {filename: ownFull, abs_path: ownFull, module: 'scaffold'},
                  {abs_path: '/tmp/app/node_modules/@coveo/create-ui/dist/download.js'},
                ],
              },
            },
          ],
        },
      });

      const [node, dep, local, own, ownAbsOnly] = processed.exception.values[0].stacktrace.frames;
      expect(node.in_app).toBe(false);
      expect(dep.in_app).toBe(false);
      expect(dep.filename).toBe('~/.npm/_npx/ab/node_modules/pacote/lib/fetch.js');
      expect(local.in_app).toBe(true);
      expect(local.filename).toBe('~/dev/ui-kit/packages/create-ui/dist/index.js');
      expect(own.filename).toBe('app:///dist/scaffold.js');
      expect(own.abs_path).toBe('app:///dist/scaffold.js');
      expect(own.in_app).toBe(true);
      expect(own.module).toBeUndefined();
      expect(JSON.stringify(own)).not.toContain('jane.doe');
      expect(ownAbsOnly.filename).toBe('app:///dist/download.js');
      expect(ownAbsOnly.in_app).toBe(true);
    });
  });
});
