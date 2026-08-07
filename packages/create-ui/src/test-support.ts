import {vi} from 'vitest';
import {CRASH_REPORT_SCHEMA_VERSION, type CrashReport} from './crash-report.js';

// Silent stand-in for `./log.js` so tests don't print to the console.
export function createLogMock() {
  return {
    info: vi.fn(),
    step: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    note: vi.fn(),
  };
}

const defaultReport: CrashReport = {
  schemaVersion: CRASH_REPORT_SCHEMA_VERSION,
  runId: 'c5c41c93-a851-4421-b27a-c8949d56dcaa',
  crashedOn: '2026-07-22T15:00:00.000Z',
  origin: 'main-rejection',
  error: {name: 'Error', message: 'boom', stack: 'Error: boom\n    at x'},
  diagnostics: {
    phase: 'dependency-installation',
    phaseElapsedMs: 2000,
    spans: [
      {
        op: 'input',
        name: 'Resolve inputs',
        startedOn: '2026-07-22T14:59:00.000Z',
        endedOn: '2026-07-22T14:59:58.000Z',
      },
      {
        op: 'dependency-installation',
        name: 'Install dependencies',
        startedOn: '2026-07-22T14:59:58.000Z',
        endedOn: '2026-07-22T15:00:00.000Z',
      },
    ],
    runtime: {processUptimeMs: 3100},
  },
  os: {platform: 'darwin', arch: 'arm64', release: '24.0.0'},
  device: {
    cpuModel: 'Apple M1 Pro',
    cpuCount: 10,
    memoryTotalBytes: 17179869184,
    memoryFreeBytes: 2147483648,
  },
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

// Overrides merge one level deep for the nested objects (so a test can tweak a
// single field), while `error` is replaced wholesale to supply cause chains.
type CrashReportOverrides = Partial<
  Omit<CrashReport, 'diagnostics' | 'os' | 'device' | 'metadata'>
> & {
  diagnostics?: Partial<CrashReport['diagnostics']>;
  os?: Partial<CrashReport['os']>;
  device?: Partial<CrashReport['device']>;
  metadata?: Partial<CrashReport['metadata']>;
};

export function createCrashReport(overrides: CrashReportOverrides = {}): CrashReport {
  return {
    ...defaultReport,
    ...overrides,
    error: overrides.error ?? defaultReport.error,
    diagnostics: {...defaultReport.diagnostics, ...overrides.diagnostics},
    os: {...defaultReport.os, ...overrides.os},
    device: {...defaultReport.device, ...overrides.device},
    metadata: {...defaultReport.metadata, ...overrides.metadata},
  };
}
