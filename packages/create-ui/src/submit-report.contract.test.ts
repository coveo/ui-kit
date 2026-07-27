import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {Event} from '@sentry/node';
import {expect, it, vi} from 'vitest';
import {CRASH_REPORT_SCHEMA_VERSION, type CrashReport} from './crash-report.js';

const sentryTransport = vi.hoisted(() => ({envelopes: [] as unknown[]}));

vi.mock('@sentry/node', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@sentry/node')>();
  return {
    ...actual,
    init(options: Parameters<typeof actual.init>[0]) {
      return actual.init({
        ...options,
        transport: () => ({
          send: async (envelope) => {
            sentryTransport.envelopes.push(envelope);
            return {statusCode: 200};
          },
          flush: async () => true,
        }),
      });
    },
  };
});

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

function eventFromEnvelope(envelope: unknown): Event {
  const [, items] = envelope as [unknown, Array<[{type: string}, Event]>];
  const eventItem = items.find(([headers]) => headers.type === 'event');
  if (eventItem === undefined) {
    throw new Error('Sentry transport did not receive an event item.');
  }
  return eventItem[1];
}

it('projects a crash report through the real Sentry SDK without network access', async () => {
  sentryTransport.envelopes.length = 0;
  const dir = await mkdtemp(join(tmpdir(), 'create-ui-sentry-contract-'));
  const path = join(dir, 'report.json');
  const report: CrashReport = {
    schemaVersion: CRASH_REPORT_SCHEMA_VERSION,
    runId: 'contract-run',
    crashedOn: '2026-07-22T15:00:00.000Z',
    error: {
      name: 'Error',
      message: 'top failure',
      stack:
        'Error: top failure\n' +
        '    at scaffold (app:///dist/scaffold.js:77:15)\n' +
        '    at main (app:///dist/index.js:88:5)',
      cause: {
        name: 'TypeError',
        message: 'root cause',
        stack:
          'TypeError: root cause\n' +
          '    at download (app:///dist/download.js:21:9)',
      },
    },
    os: {platform: 'darwin', arch: 'arm64', release: '25.3.0'},
    metadata: {
      template: 'atomic-search',
      templateVersion: '3.60.2',
      createdWith: 'create-ui@1.2.3',
      createdOn: '2026-07-22T14:59:00.000Z',
      dependencies: {'@coveo/atomic': '3.60.2'},
      node: '24.14.1',
      packageManager: 'npm',
    },
  };

  try {
    await writeFile(path, JSON.stringify(report));

    expect(await submitReport(path)).toBe(0);
    expect(sentryTransport.envelopes).toHaveLength(1);

    const event = eventFromEnvelope(sentryTransport.envelopes[0]);
    expect(event.timestamp).toBe(Date.parse(report.crashedOn) / 1000);
    expect(event.environment).toBe('production');
    expect(event.level).toBe('error');
    expect(event.tags).toMatchObject({
      run_id: 'contract-run',
      template: 'atomic-search',
      template_version: '3.60.2',
      cli: 'create-ui@1.2.3',
      node: '24.14.1',
      package_manager: 'npm',
      os: 'darwin',
      arch: 'arm64',
    });
    expect(event.contexts).toMatchObject({
      os: {name: 'darwin', version: '25.3.0'},
      runtime: {name: 'node', version: 'v24.14.1'},
    });
    expect(event.extra).toMatchObject({
      dependencies: {'@coveo/atomic': '3.60.2'},
      createdOn: '2026-07-22T14:59:00.000Z',
    });

    const exceptions = event.exception?.values ?? [];
    expect(exceptions.map(({type, value}) => ({type, value}))).toEqual([
      {type: 'TypeError', value: 'root cause'},
      {type: 'Error', value: 'top failure'},
    ]);
    const top = exceptions.find(({value}) => value === 'top failure');
    const cause = exceptions.find(({value}) => value === 'root cause');
    expect(top?.stacktrace?.frames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filename: 'app:///dist/scaffold.js',
          abs_path: 'app:///dist/scaffold.js',
          lineno: 77,
          colno: 15,
          in_app: true,
        }),
      ])
    );
    expect(cause?.stacktrace?.frames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filename: 'app:///dist/download.js',
          abs_path: 'app:///dist/download.js',
          lineno: 21,
          colno: 9,
          in_app: true,
        }),
      ])
    );
    expect(event.breadcrumbs ?? []).toEqual([]);
    expect(event).not.toHaveProperty('server_name');
    expect(event).not.toHaveProperty('user');
  } finally {
    await rm(dir, {recursive: true, force: true});
  }
});
