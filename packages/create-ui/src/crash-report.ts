import {randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {arch, platform, release, tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildProjectMetadata, type ProjectMetadata} from './metadata.js';
import {CrashReportError} from './errors.js';

export const CRASH_REPORT_SCHEMA_VERSION = 1;

export interface RunContext {
  template?: string;
  templateVersion?: string;
  metadata?: ProjectMetadata;
}

let currentContext: RunContext = {};

export function setRunContext(update: RunContext): void {
  currentContext = {...currentContext, ...update};
}

export function resetRunContext(): void {
  currentContext = {};
}

// Reduce absolute paths / file:// URLs (anchored to a delimiter so URLs and
// `node:` module ids are left alone) to just the file name — no directory, and
// no embedded username, leaves the machine (ADR 003 #5).
const FILESYSTEM_PATH =
  /(?<=^|[\s('"=])(?:file:\/\/)?(?:[A-Za-z]:)?(?:[/\\][^\s/\\:()]+)+/g;

export function redactPaths(text: string): string {
  return text.replace(FILESYSTEM_PATH, (match) => {
    const segments = match.split(/[/\\]/).filter(Boolean);
    return segments[segments.length - 1] ?? match;
  });
}

interface CrashErrorInfo {
  name: string;
  message: string;
  stack?: string;
}

interface CrashOsInfo {
  platform: string;
  arch: string;
  release: string;
}

export interface CrashReport {
  schemaVersion: number;
  runId: string;
  crashedOn: string;
  error: CrashErrorInfo;
  os: CrashOsInfo;
  metadata: ProjectMetadata;
}

function toErrorInfo(error: unknown): CrashErrorInfo {
  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: redactPaths(error.message),
      stack:
        typeof error.stack === 'string' ? redactPaths(error.stack) : undefined,
    };
  }
  const raw = typeof error === 'string' ? error : String(error);
  return {name: 'NonError', message: redactPaths(raw)};
}

// Prefer the metadata captured in-memory during scaffolding (it survives the
// target-dir cleanup on failure); fall back to runtime state for early crashes.
function resolveMetadata(context: RunContext): ProjectMetadata {
  return (
    context.metadata ??
    buildProjectMetadata({
      template: context.template ?? 'unknown',
      templateVersion: context.templateVersion ?? '',
      dependencies: {},
    })
  );
}

export function buildCrashReport(error: unknown): CrashReport {
  return {
    schemaVersion: CRASH_REPORT_SCHEMA_VERSION,
    runId: randomUUID(),
    crashedOn: new Date().toISOString(),
    error: toErrorInfo(error),
    os: {platform: platform(), arch: arch(), release: release()},
    metadata: resolveMetadata(currentContext),
  };
}

export function crashReportPath(runId: string): string {
  return join(tmpdir(), `create-ui-crash-${runId}.json`);
}

export async function writeCrashReport(report: CrashReport): Promise<string> {
  const file = crashReportPath(report.runId);
  await writeFile(file, `${JSON.stringify(report, null, 2)}\n`);
  return file;
}

function isCrashReport(value: unknown): value is CrashReport {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<CrashReport>;
  return (
    typeof candidate.schemaVersion === 'number' &&
    typeof candidate.runId === 'string' &&
    typeof candidate.crashedOn === 'string' &&
    typeof candidate.error === 'object' &&
    candidate.error !== null &&
    typeof candidate.os === 'object' &&
    candidate.os !== null &&
    typeof candidate.metadata === 'object' &&
    candidate.metadata !== null
  );
}

export function parseCrashReport(raw: string): CrashReport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new CrashReportError('not-a-report');
  }
  if (!isCrashReport(parsed)) {
    throw new CrashReportError('not-a-report');
  }
  if (parsed.schemaVersion !== CRASH_REPORT_SCHEMA_VERSION) {
    throw new CrashReportError('version-mismatch', parsed.schemaVersion);
  }
  return parsed;
}
