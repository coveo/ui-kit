import {randomUUID} from 'node:crypto';
import {mkdir, writeFile} from 'node:fs/promises';
import {arch, homedir, platform, release, tmpdir} from 'node:os';
import {join} from 'node:path';
import {buildProjectMetadata, type ProjectMetadata} from './metadata.js';
import {
  type CrashDiagnostics,
  isCrashDiagnostics,
  snapshotCrashDiagnostics,
} from './crash-diagnostics.js';
import {CrashReportError} from './errors.js';

export const CRASH_REPORT_SCHEMA_VERSION = 1;

const CRASH_ORIGINS = [
  'unknown',
  'uncaught-exception',
  'unhandled-rejection',
  'main-rejection',
] as const;

export type CrashOrigin = (typeof CRASH_ORIGINS)[number];

function isCrashOrigin(value: unknown): value is CrashOrigin {
  return typeof value === 'string' && CRASH_ORIGINS.includes(value as CrashOrigin);
}

// Bound the captured `error.cause` chain so a deep or cyclic chain cannot bloat
// the report; each link is reduced to the same {name, message, stack} shape as
// the top-level error — never arbitrary error properties (ADR 003 #5/#6).
export const MAX_CAUSE_DEPTH = 5;

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

// Replace the user's home directory with `~` so non-own paths cannot leak a
// username or machine-specific root while retaining their file relationships.
// Own-package stack paths are normalized separately to `app:///…` below. Both
// the native path and the forward-slash form used in `file://` URLs are covered;
// `node:` ids and http(s) URLs are untouched. The home is injectable for testing
// (defaults to the real home directory).
export function redactPaths(text: string, home: string = homedir()): string {
  // Guard against an empty or filesystem-root home; replacing "/" would mangle
  // every path rather than just the machine-specific prefix.
  if (home.length <= 1) {
    return text;
  }
  let result = text;
  for (const variant of new Set([home, home.replaceAll('\\', '/')])) {
    result = result.replaceAll(variant, '~');
  }
  return result;
}

const OWN_PACKAGE_TAIL = /^.*[/\\]node_modules[/\\]@coveo[/\\]create-ui[/\\]/;
const APP_PREFIX = 'app:///';

export function ownPackageAppPath(path: string): string | undefined {
  if (path.startsWith(APP_PREFIX)) {
    return path;
  }
  const marker = OWN_PACKAGE_TAIL.exec(path);
  if (marker === null) {
    return undefined;
  }
  return `${APP_PREFIX}${path.slice(marker[0].length).replaceAll('\\', '/')}`;
}

function normalizeOwnPackageStackLine(line: string): string {
  const openParenthesis = line.lastIndexOf('(');
  if (openParenthesis !== -1) {
    const appPath = ownPackageAppPath(line.slice(openParenthesis + 1));
    if (appPath !== undefined) {
      return `${line.slice(0, openParenthesis + 1)}${appPath}`;
    }
  }

  const bareFrame = /^(\s*at\s+(?:async\s+)?)(.*)$/.exec(line);
  if (bareFrame !== null) {
    const appPath = ownPackageAppPath(bareFrame[2]);
    if (appPath !== undefined) {
      return `${bareFrame[1]}${appPath}`;
    }
  }
  return line;
}

function normalizeStack(stack: string): string {
  return redactPaths(stack.split('\n').map(normalizeOwnPackageStackLine).join('\n'));
}
export interface CrashErrorInfo {
  name: string;
  message: string;
  stack?: string;
  cause?: CrashErrorInfo;
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
  origin: CrashOrigin;
  error: CrashErrorInfo;
  diagnostics: CrashDiagnostics;
  os: CrashOsInfo;
  metadata: ProjectMetadata;
}

function normalizeError(error: unknown, depth: number, seen: Set<unknown>): CrashErrorInfo {
  if (!(error instanceof Error)) {
    const raw = typeof error === 'string' ? error : String(error);
    return {name: 'NonError', message: redactPaths(raw)};
  }
  const info: CrashErrorInfo = {
    name: error.name || 'Error',
    message: redactPaths(error.message),
    stack: typeof error.stack === 'string' ? normalizeStack(error.stack) : undefined,
  };
  const cause = (error as Error & {cause?: unknown}).cause;
  if (cause !== undefined && depth < MAX_CAUSE_DEPTH && !seen.has(cause)) {
    seen.add(cause);
    info.cause = normalizeError(cause, depth + 1, seen);
  }
  return info;
}

function toErrorInfo(error: unknown): CrashErrorInfo {
  return normalizeError(error, 0, new Set<unknown>([error]));
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

export function buildCrashReport(error: unknown, origin: CrashOrigin = 'unknown'): CrashReport {
  return {
    schemaVersion: CRASH_REPORT_SCHEMA_VERSION,
    runId: randomUUID(),
    crashedOn: new Date().toISOString(),
    origin,
    error: toErrorInfo(error),
    diagnostics: snapshotCrashDiagnostics(),
    os: {platform: platform(), arch: arch(), release: release()},
    metadata: resolveMetadata(currentContext),
  };
}

const CRASH_REPORT_REFERENCE_LENGTH = 12;
const CRASH_REPORT_REFERENCE_PATTERN = /^[a-f\d]{12}$/i;
const CRASH_REPORT_DIRECTORY = join(tmpdir(), '@coveo', 'create-ui', 'crash-reports');

export function crashReportReference(runId: string): string {
  return runId.replaceAll('-', '').slice(0, CRASH_REPORT_REFERENCE_LENGTH).toLowerCase();
}

function crashReportPathFromReference(reference: string): string {
  return join(CRASH_REPORT_DIRECTORY, `${reference}.json`);
}

export function crashReportPath(runId: string): string {
  return crashReportPathFromReference(crashReportReference(runId));
}

export function resolveCrashReportPath(referenceOrPath: string): string {
  const candidate = referenceOrPath.trim();
  return CRASH_REPORT_REFERENCE_PATTERN.test(candidate)
    ? crashReportPathFromReference(candidate.toLowerCase())
    : referenceOrPath;
}

export async function writeCrashReport(report: CrashReport): Promise<string> {
  const file = crashReportPath(report.runId);
  await mkdir(CRASH_REPORT_DIRECTORY, {recursive: true, mode: 0o700});
  await writeFile(file, `${JSON.stringify(report, null, 2)}\n`, {
    mode: 0o600,
  });
  return file;
}

interface CrashReportV1 extends Omit<CrashReport, 'schemaVersion'> {
  schemaVersion: 1;
}

function isCrashErrorInfo(value: unknown, depth = 0): value is CrashErrorInfo {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<CrashErrorInfo>;
  if (
    typeof candidate.name !== 'string' ||
    typeof candidate.message !== 'string' ||
    (candidate.stack !== undefined && typeof candidate.stack !== 'string')
  ) {
    return false;
  }
  return (
    candidate.cause === undefined ||
    (depth < MAX_CAUSE_DEPTH && isCrashErrorInfo(candidate.cause, depth + 1))
  );
}

function isCrashReportV1(value: unknown): value is CrashReportV1 {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const candidate = value as Partial<CrashReportV1>;
  return (
    candidate.schemaVersion === 1 &&
    typeof candidate.runId === 'string' &&
    typeof candidate.crashedOn === 'string' &&
    isCrashOrigin(candidate.origin) &&
    isCrashErrorInfo(candidate.error) &&
    isCrashDiagnostics(candidate.diagnostics) &&
    typeof candidate.os === 'object' &&
    candidate.os !== null &&
    typeof candidate.metadata === 'object' &&
    candidate.metadata !== null
  );
}

type CrashReportMigrator = (value: unknown) => CrashReport | null;

function migrateCrashReportV1(value: unknown): CrashReport | null {
  if (!isCrashReportV1(value)) {
    return null;
  }
  return {
    schemaVersion: CRASH_REPORT_SCHEMA_VERSION,
    runId: value.runId,
    crashedOn: value.crashedOn,
    origin: value.origin,
    error: value.error,
    diagnostics: value.diagnostics,
    os: value.os,
    metadata: value.metadata,
  };
}

const CRASH_REPORT_MIGRATORS = new Map<number, CrashReportMigrator>([[1, migrateCrashReportV1]]);

function schemaVersionOf(value: unknown): number | undefined {
  if (typeof value !== 'object' || value === null) {
    return undefined;
  }
  const schemaVersion = (value as {schemaVersion?: unknown}).schemaVersion;
  return typeof schemaVersion === 'number' ? schemaVersion : undefined;
}

export function parseCrashReport(raw: string): CrashReport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new CrashReportError('not-a-report');
  }

  const schemaVersion = schemaVersionOf(parsed);
  if (schemaVersion === undefined) {
    throw new CrashReportError('not-a-report');
  }
  const migrate = CRASH_REPORT_MIGRATORS.get(schemaVersion);
  if (migrate === undefined) {
    throw new CrashReportError('version-mismatch', schemaVersion);
  }
  const report = migrate(parsed);
  if (report === null) {
    throw new CrashReportError('not-a-report');
  }
  return report;
}
