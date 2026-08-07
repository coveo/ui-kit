import {mkdtemp, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import type {Event} from '@sentry/node';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {createCrashReport} from './test-support.js';

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

vi.mock('./log.js', async () => ({log: (await import('./test-support.js')).createLogMock()}));

const {submitReport} = await import('./submit-report.js');

function envelopeItem(envelopes: unknown[], type: string): Event {
  for (const envelope of envelopes) {
    const [, items] = envelope as [unknown, Array<[{type: string}, Event]>];
    const item = items.find(([headers]) => headers.type === type);
    if (item !== undefined) {
      return item[1];
    }
  }
  throw new Error(`Sentry transport did not receive a "${type}" item.`);
}

const crashedOn = '2026-07-22T15:00:00.000Z';
const spanStart = '2026-07-22T14:59:00.000Z';
const report = createCrashReport({
  runId: 'contract-run',
  crashedOn,
  origin: 'unhandled-rejection',
  error: {
    name: 'Error',
    message: 'top failure',
    stack: 'Error: top failure\n    at scaffold (app:///dist/scaffold.js:77:15)',
    cause: {
      name: 'TypeError',
      message: 'root cause',
      stack: 'TypeError: root cause\n    at download (app:///dist/download.js:21:9)',
    },
  },
  diagnostics: {
    spans: [
      {
        op: 'input',
        name: 'Resolve inputs',
        startedOn: spanStart,
        endedOn: '2026-07-22T14:59:05.000Z',
      },
      {
        op: 'template-download',
        name: 'atomic-search@3.60.2',
        startedOn: '2026-07-22T14:59:05.000Z',
        endedOn: '2026-07-22T14:59:58.000Z',
        attributes: {'coveo.template': 'atomic-search', 'coveo.template_version': '3.60.2'},
      },
      {
        op: 'dependency-installation',
        name: 'Install dependencies',
        startedOn: '2026-07-22T14:59:58.000Z',
        endedOn: crashedOn,
      },
    ],
  },
  metadata: {
    template: 'atomic-search',
    templateVersion: '3.60.2',
    dependencies: {'@coveo/atomic': '3.60.2'},
    node: '24.14.1',
    packageManager: 'npm',
  },
});

describe('submit-report Sentry contract', () => {
  let event: Event;
  let transaction: Event;

  beforeAll(async () => {
    sentryTransport.envelopes.length = 0;
    const dir = await mkdtemp(join(tmpdir(), 'create-ui-sentry-contract-'));
    const path = join(dir, 'report.json');
    try {
      await writeFile(path, JSON.stringify(report));
      expect(await submitReport(path)).toBe(0);
      event = envelopeItem(sentryTransport.envelopes, 'event');
      transaction = envelopeItem(sentryTransport.envelopes, 'transaction');
    } finally {
      await rm(dir, {recursive: true, force: true});
    }
  });

  it('serializes the report as a privacy-safe error event', () => {
    expect(event).toMatchObject({
      timestamp: Date.parse(crashedOn) / 1000,
      release: 'create-ui@1.2.3',
      environment: 'production',
      level: 'error',
      transaction: 'create atomic-search',
      tags: {
        run_id: 'contract-run',
        template: 'atomic-search',
        template_version: '3.60.2',
        cli: 'create-ui@1.2.3',
        node: '24.14.1',
        package_manager: 'npm',
        os: 'darwin',
        arch: 'arm64',
        crash_origin: 'unhandled-rejection',
      },
      contexts: {
        device: {
          arch: 'arm64',
          cpu_description: 'Apple M1 Pro',
          processor_count: 10,
          memory_size: 17179869184,
          free_memory: 2147483648,
        },
        Custom: {phase: 'dependency-installation', phase_elapsed: '2 s', process_uptime: '3.1 s'},
      },
      extra: {
        dependencies: {'@coveo/atomic': '3.60.2'},
        createdOn: '2026-07-22T14:59:00.000Z',
      },
    });
    expect(event.breadcrumbs ?? []).toEqual([]);
    expect(event).not.toHaveProperty('server_name');
    expect(event).not.toHaveProperty('user');
  });

  it('serializes linked exceptions with normalized application frames', () => {
    const exceptions = event.exception?.values ?? [];
    expect(exceptions.map(({type, value}) => ({type, value}))).toEqual([
      {type: 'TypeError', value: 'root cause'},
      {type: 'Error', value: 'top failure'},
    ]);

    expect(exceptions[0]).toMatchObject({
      stacktrace: {
        frames: expect.arrayContaining([
          expect.objectContaining({
            filename: 'app:///dist/download.js',
            lineno: 21,
            colno: 9,
            in_app: true,
          }),
        ]),
      },
    });
    expect(exceptions[1]).toMatchObject({
      mechanism: {type: 'unhandled-rejection', handled: false},
      stacktrace: {
        frames: expect.arrayContaining([
          expect.objectContaining({
            filename: 'app:///dist/scaffold.js',
            lineno: 77,
            colno: 15,
            in_app: true,
          }),
        ]),
      },
    });
  });

  it('serializes the stored spans as a transaction on the error trace', () => {
    expect(transaction).toMatchObject({
      type: 'transaction',
      transaction: 'create atomic-search',
      start_timestamp: Date.parse(spanStart) / 1000,
      timestamp: Date.parse(crashedOn) / 1000,
      contexts: {
        trace: {trace_id: expect.any(String), span_id: expect.any(String), op: 'create-ui'},
      },
      spans: expect.arrayContaining([
        expect.objectContaining({op: 'input.resolve', description: 'Resolve inputs', data: {}}),
        expect.objectContaining({
          op: 'template.download',
          description: 'atomic-search@3.60.2',
          data: {'coveo.template': 'atomic-search', 'coveo.template_version': '3.60.2'},
        }),
        expect.objectContaining({
          op: 'dependencies.install',
          description: 'Install dependencies',
          data: {},
        }),
      ]),
    });
    expect(event.contexts?.trace?.trace_id).toBe(transaction.contexts?.trace?.trace_id);
  });
});
