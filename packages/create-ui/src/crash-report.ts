import {randomUUID} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {arch, homedir, platform, release, tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildProjectMetadata, type ProjectMetadata} from './metadata.js';
import {CrashReportError} from './errors.js';
import {readProvenance} from './provenance.js';

export const CRASH_REPORT_SCHEMA_VERSION = 1;

export interface RunContext {
  template?: string;
  templateVersion?: string;
  targetDir?: string;
  projectName?: string;
}

let currentContext: RunContext = {};

export function setRunContext(update: RunContext): void {
  currentContext = {...currentContext, ...update};
}

export function resetRunContext(): void {
  currentContext = {};
}

export function scrub(text: string): string {
  const home = homedir();
  if (home.length === 0) {
    return text;
  }
  let result = text.replaceAll(home, '~');
  const forwardSlashHome = home.replaceAll('\\', '/');
  if (forwardSlashHome !== home) {
    result = result.replaceAll(forwardSlashHome, '~');
  }
  return result;
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
      message: scrub(error.message),
      stack: typeof error.stack === 'string' ? scrub(error.stack) : undefined,
    };
  }
  const raw = typeof error === 'string' ? error : String(error);
  return {name: 'NonError', message: scrub(raw)};
}

// Prefer the provenance file (written before dependency install, a common crash
// point) for recorded dependency versions; fall back to runtime state.
async function resolveMetadata(context: RunContext): Promise<ProjectMetadata> {
  if (context.targetDir !== undefined) {
    const fromProvenance = await readProvenance(context.targetDir);
    if (fromProvenance) {
      return fromProvenance;
    }
  }
  return buildProjectMetadata({
    template: context.template ?? 'unknown',
    templateVersion: context.templateVersion ?? '',
    dependencies: {},
  });
}

export async function buildCrashReport(error: unknown): Promise<CrashReport> {
  return {
    schemaVersion: CRASH_REPORT_SCHEMA_VERSION,
    runId: randomUUID(),
    crashedOn: new Date().toISOString(),
    error: toErrorInfo(error),
    os: {platform: platform(), arch: arch(), release: release()},
    metadata: await resolveMetadata(currentContext),
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
