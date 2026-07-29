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

function itemFromEnvelopes(envelopes: unknown[], type: string): Event {
  for (const envelope of envelopes) {
    const [, items] = envelope as [unknown, Array<[{type: string}, Event]>];
    const match = items.find(([headers]) => headers.type === type);
    if (match !== undefined) {
      return match[1];
    }
  }
  throw new Error(`Sentry transport did not receive a "${type}" item.`);
}

const crashedOn = '2026-07-22T15:00:00.000Z';
const spanStart = '2026-07-22T14:59:00.000Z';

// Stack frames are already `app:///`-normalized (as the capture side writes them)
// so the contract can assert the exact projection the real SDK produces.
const contractReport = createCrashReport({
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

describe('submit-report contract (real Sentry SDK, no network)', () => {
  let event: Event;
  let transaction: Event;

  beforeAll(async () => {
    sentryTransport.envelopes.length = 0;
    const dir = await mkdtemp(join(tmpdir(), 'create-ui-sentry-contract-'));
    const path = join(dir, 'report.json');
    try {
      await writeFile(path, JSON.stringify(contractReport));
      expect(await submitReport(path)).toBe(0);
      event = itemFromEnvelopes(sentryTransport.envelopes, 'event');
      transaction = itemFromEnvelopes(sentryTransport.envelopes, 'transaction');
    } finally {
      await rm(dir, {recursive: true, force: true});
    }
  });

  // os/runtime contexts are overwritten by the SDK with the live runtime, so the
  // crash's own os/arch are asserted via tags instead of the (env-dependent) contexts.
  it('projects the report into the event: metadata, tags, contexts, and privacy', () => {
    expect(event).toMatchObject({
      timestamp: Date.parse(crashedOn) / 1000,
      release: 'create-ui@1.2.3',
      environment: 'production',
      level: 'error',
      tags: {
        run_id: 'contract-run',
        template: 'atomic-search',
        node: '24.14.1',
        package_manager: 'npm',
        os: 'darwin',
        arch: 'arm64',
        crash_origin: 'unhandled-rejection',
      },
      contexts: {
        device: {cpu_description: 'Apple M1 Pro', processor_count: 10},
        Custom: {phase: 'dependency-installation', phase_elapsed: '2 s', process_uptime: '3.1 s'},
      },
      extra: {dependencies: {'@coveo/atomic': '3.60.2'}},
    });
    expect(event.breadcrumbs ?? []).toEqual([]);
    expect(event).not.toHaveProperty('server_name');
    expect(event).not.toHaveProperty('user');
  });

  it('reconstructs the cause chain as linked exceptions with app:/// frames', () => {
    const exceptions = event.exception?.values ?? [];
    expect(exceptions.map(({type, value}) => ({type, value}))).toEqual([
      {type: 'TypeError', value: 'root cause'},
      {type: 'Error', value: 'top failure'},
    ]);
    const top = exceptions.find(({value}) => value === 'top failure');
    expect(top?.mechanism).toEqual({type: 'unhandled-rejection', handled: false});
    expect(top?.stacktrace?.frames).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          filename: 'app:///dist/scaffold.js',
          lineno: 77,
          colno: 15,
          in_app: true,
        }),
      ])
    );
  });

  it('replays the phase spans as a product-named transaction sharing the crash trace', () => {
    expect(transaction.type).toBe('transaction');
    expect(transaction.transaction).toBe('create atomic-search');
    expect(transaction.start_timestamp).toBe(Date.parse(spanStart) / 1000);
    expect(transaction.timestamp).toBe(Date.parse(crashedOn) / 1000);
    expect((transaction.spans ?? []).map((span) => span.op)).toEqual(
      expect.arrayContaining(['input.resolve', 'template.download', 'dependencies.install'])
    );
    const downloadSpan = (transaction.spans ?? []).find((span) => span.op === 'template.download');
    expect(downloadSpan?.description).toBe('atomic-search@3.60.2');
    expect(downloadSpan?.data).toMatchObject({'coveo.template': 'atomic-search'});
    expect(event.contexts?.trace?.trace_id).toBe(transaction.contexts?.trace?.trace_id);
    expect(event.transaction).toBe('create atomic-search');
  });
});
