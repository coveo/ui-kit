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

it('projects a crash report through the real Sentry SDK without network access', async () => {
  sentryTransport.envelopes.length = 0;
  const dir = await mkdtemp(join(tmpdir(), 'create-ui-sentry-contract-'));
  const path = join(dir, 'report.json');
  const report: CrashReport = {
    schemaVersion: CRASH_REPORT_SCHEMA_VERSION,
    runId: 'contract-run',
    crashedOn: '2026-07-22T15:00:00.000Z',
    origin: 'unhandled-rejection',
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
        stack: 'TypeError: root cause\n' + '    at download (app:///dist/download.js:21:9)',
      },
    },
    diagnostics: {
      phase: 'dependency-installation',
      phaseElapsedMs: 2000,
      spans: [
        {
          op: 'input',
          name: 'Resolve inputs',
          startedOn: '2026-07-22T14:59:00.000Z',
          endedOn: '2026-07-22T14:59:05.000Z',
        },
        {
          op: 'template-download',
          name: 'atomic-search@3.60.2',
          startedOn: '2026-07-22T14:59:05.000Z',
          endedOn: '2026-07-22T14:59:58.000Z',
          attributes: {
            'coveo.template': 'atomic-search',
            'coveo.template_version': '3.60.2',
          },
        },
        {
          op: 'dependency-installation',
          name: 'Install dependencies',
          startedOn: '2026-07-22T14:59:58.000Z',
          endedOn: '2026-07-22T15:00:00.000Z',
        },
      ],
      runtime: {
        processUptimeMs: 3100,
      },
    },
    os: {platform: 'darwin', arch: 'arm64', release: '25.3.0'},
    device: {
      cpuModel: 'Apple M1',
      cpuCount: 8,
      memoryTotalBytes: 17179869184,
      memoryFreeBytes: 3221225472,
    },
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

    const event = itemFromEnvelopes(sentryTransport.envelopes, 'event');
    expect(event.timestamp).toBe(Date.parse(report.crashedOn) / 1000);
    expect(event.release).toBe('create-ui@1.2.3');
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
      crash_origin: 'unhandled-rejection',
    });
    expect(event.contexts).toMatchObject({
      os: {name: 'darwin', version: '25.3.0'},
      runtime: {name: 'node', version: 'v24.14.1'},
      device: {
        arch: 'arm64',
        cpu_description: 'Apple M1',
        processor_count: 8,
        memory_size: 17179869184,
        free_memory: 3221225472,
      },
      Custom: {
        phase: 'dependency-installation',
        phase_elapsed: '2 s',
        process_uptime: '3.1 s',
      },
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
    expect(top?.mechanism).toEqual({
      type: 'unhandled-rejection',
      handled: false,
    });
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

    // The persisted phase spans are reconstructed as a transaction using their
    // original timestamps, and it shares the crash's trace so the waterfall
    // surfaces on the Issue — with no live instrumentation.
    const transaction = itemFromEnvelopes(sentryTransport.envelopes, 'transaction');
    expect(transaction.type).toBe('transaction');
    // The transaction is named after what was scaffolded, so the crash Issue and
    // the waterfall group by product instead of a constant "scaffold" label.
    expect(transaction.transaction).toBe('create atomic-search');
    expect(transaction.start_timestamp).toBe(Date.parse('2026-07-22T14:59:00.000Z') / 1000);
    expect(transaction.timestamp).toBe(Date.parse('2026-07-22T15:00:00.000Z') / 1000);
    expect((transaction.spans ?? []).map((span) => span.op)).toEqual(
      expect.arrayContaining(['input.resolve', 'template.download', 'dependencies.install'])
    );
    const downloadSpan = (transaction.spans ?? []).find((span) => span.op === 'template.download');
    expect(downloadSpan?.description).toBe('atomic-search@3.60.2');
    expect(downloadSpan?.data).toMatchObject({
      'coveo.template': 'atomic-search',
      'coveo.template_version': '3.60.2',
    });
    // Non-download spans surface their human label; the op names the operation
    // (e.g. `input.resolve — Resolve inputs`).
    const inputSpan = (transaction.spans ?? []).find((span) => span.op === 'input.resolve');
    expect(inputSpan?.description).toBe('Resolve inputs');
    expect(transaction.contexts?.trace?.trace_id).toEqual(expect.any(String));
    expect(event.contexts?.trace?.trace_id).toBe(transaction.contexts?.trace?.trace_id);
    // The crash is captured inside the transaction, so the Issue inherits the
    // product-scoped transaction name for triage.
    expect(event.transaction).toBe('create atomic-search');
  } finally {
    await rm(dir, {recursive: true, force: true});
  }
});
