import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {homedir, tmpdir} from 'node:os';
import {join} from 'node:path';
import type {Event} from '@sentry/node';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {crashReportReference, MAX_CAUSE_DEPTH, writeCrashReport} from './crash-report.js';
import {createCrashReport} from './test-support.js';

const log = vi.hoisted(() => ({
  info: vi.fn(),
  step: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  note: vi.fn(),
}));

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureEvent: vi.fn(),
  flush: vi.fn(async () => true),
  close: vi.fn(async () => true),
  linkedErrorsIntegration: vi.fn((options?: {limit?: number}) => ({
    name: 'LinkedErrors',
    ...options,
  })),
}));

vi.mock('@sentry/node', () => sentry);
vi.mock('./log.js', () => ({log}));

const {submitReport} = await import('./submit-report.js');

type SentryOptions = {
  beforeSend: (event: Event) => Event | null;
  environment: string;
  release: string;
  dsn: string;
  defaultIntegrations: boolean;
  sendDefaultPii: boolean;
  includeServerName: boolean;
  integrations: unknown[];
};

function initOptions(): SentryOptions {
  return sentry.init.mock.calls[0][0];
}

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

  async function applyBeforeSend(event: Event): Promise<Event> {
    await submitReport(await writeReport());
    const processed = initOptions().beforeSend(event);
    expect(processed).not.toBeNull();
    return processed!;
  }

  it('rejects a missing or invalid report without initializing Sentry', async () => {
    expect(await submitReport(undefined)).toBe(1);
    const invalidPath = join(dir, 'invalid.json');
    await writeFile(invalidPath, JSON.stringify({not: 'a report'}));
    expect(await submitReport(invalidPath)).toBe(1);
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it('does not send a report when DO_NOT_TRACK is set', async () => {
    vi.stubEnv('DO_NOT_TRACK', '1');

    expect(await submitReport(await writeReport())).toBe(0);
    expect(sentry.init).not.toHaveBeenCalled();
  });

  it('configures Sentry with the report release and privacy-safe defaults', async () => {
    expect(await submitReport(await writeReport())).toBe(0);

    expect(initOptions()).toMatchObject({
      release: 'create-ui@1.2.3',
      environment: 'production',
      defaultIntegrations: false,
      sendDefaultPii: false,
      includeServerName: false,
    });
    expect(initOptions().dsn.length).toBeGreaterThan(0);
    expect(sentry.linkedErrorsIntegration).toHaveBeenCalledWith({limit: MAX_CAUSE_DEPTH});
    expect(initOptions().integrations).toEqual([expect.objectContaining({name: 'LinkedErrors'})]);
  });

  it('uses SENTRY_ENVIRONMENT when provided', async () => {
    vi.stubEnv('SENTRY_ENVIRONMENT', 'development');

    await submitReport(await writeReport());

    expect(initOptions().environment).toBe('development');
  });

  it('captures the crash and its transaction on the same trace, then closes Sentry', async () => {
    expect(await submitReport(await writeReport())).toBe(0);

    expect(sentry.captureException).toHaveBeenCalledOnce();
    expect(sentry.captureEvent).toHaveBeenCalledOnce();
    expect(sentry.flush).toHaveBeenCalledOnce();
    expect(sentry.close).toHaveBeenCalledOnce();

    const transaction = sentry.captureEvent.mock.calls[0][0] as Event;
    const processed = initOptions().beforeSend({});
    expect(processed?.contexts?.trace?.trace_id).toBe(transaction.contexts?.trace?.trace_id);
  });

  it('captures only the crash when the report has no phase spans', async () => {
    expect(await submitReport(await writeReport({diagnostics: {spans: []}}))).toBe(0);

    expect(sentry.captureException).toHaveBeenCalledOnce();
    expect(sentry.captureEvent).not.toHaveBeenCalled();
  });

  it('submits a report by its short reference', async () => {
    const report = createCrashReport();
    const path = await writeCrashReport(report);
    try {
      expect(await submitReport(crashReportReference(report.runId))).toBe(0);
      expect(sentry.captureException).toHaveBeenCalledOnce();
    } finally {
      await rm(path, {force: true});
    }
  });

  it('reconstructs a captured error cause chain', async () => {
    await submitReport(
      await writeReport({
        error: {
          name: 'Error',
          message: 'boom',
          cause: {name: 'TypeError', message: 'root cause'},
        },
      })
    );

    const captured = sentry.captureException.mock.calls[0][0] as Error & {cause?: Error};
    expect(captured).toMatchObject({
      name: 'Error',
      message: 'boom',
      cause: {name: 'TypeError', message: 'root cause'},
    });
  });

  it('returns failure when the report cannot be flushed', async () => {
    sentry.flush.mockResolvedValueOnce(false);

    expect(await submitReport(await writeReport())).toBe(1);

    expect(log.warn).toHaveBeenCalledOnce();
    expect(sentry.close).toHaveBeenCalledOnce();
  });

  it('returns failure when the Sentry SDK throws', async () => {
    sentry.captureException.mockImplementationOnce(() => {
      throw new Error('Sentry unavailable');
    });

    expect(await submitReport(await writeReport())).toBe(1);

    expect(log.error).toHaveBeenCalledOnce();
  });

  describe('beforeSend', () => {
    it('preserves the crash timestamp and redacts path-bearing messages', async () => {
      const home = homedir();
      const processed = await applyBeforeSend({
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

      expect(processed).toMatchObject({
        timestamp: Date.parse('2026-07-22T15:00:00.000Z') / 1000,
        transaction: 'create headless-search-react',
        message: 'failed at ~/project',
      });
      const [cause, top] = processed.exception?.values ?? [];
      expect(top).toMatchObject({
        value: 'boom at ~/project/index.js',
        mechanism: {type: 'main-rejection', handled: false},
      });
      expect(cause?.value).toBe('ENOENT: open ~/project/.env');
      expect(cause?.stacktrace?.frames?.[0].filename).toBe('~/project/db.js');
    });

    it('classifies stack frames without leaking install paths', async () => {
      const home = homedir();
      const ownPackagePath =
        '/tmp/app/node_modules/.pnpm/@coveo+create-ui@file+..+Users+jane.doe+ui-kit_045/node_modules/@coveo/create-ui/dist/scaffold.js';
      const processed = await applyBeforeSend({
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
                  {filename: ownPackagePath, abs_path: ownPackagePath, module: 'scaffold'},
                  {abs_path: '/tmp/app/node_modules/@coveo/create-ui/dist/download.js'},
                ],
              },
            },
          ],
        },
      });

      const [node, dependency, local, ownPackage, ownPackageAbsOnly] =
        processed.exception?.values?.[0].stacktrace?.frames ?? [];
      expect(node?.in_app).toBe(false);
      expect(dependency).toMatchObject({
        in_app: false,
        filename: '~/.npm/_npx/ab/node_modules/pacote/lib/fetch.js',
      });
      expect(local).toMatchObject({
        in_app: true,
        filename: '~/dev/ui-kit/packages/create-ui/dist/index.js',
      });
      expect(ownPackage).toMatchObject({
        filename: 'app:///dist/scaffold.js',
        abs_path: 'app:///dist/scaffold.js',
        in_app: true,
      });
      expect(ownPackage?.module).toBeUndefined();
      expect(JSON.stringify(ownPackage)).not.toContain('jane.doe');
      expect(ownPackageAbsOnly).toMatchObject({
        filename: 'app:///dist/download.js',
        in_app: true,
      });
    });
  });
});
