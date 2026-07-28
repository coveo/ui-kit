import {readFile} from 'node:fs/promises';
import type {Breadcrumb, ErrorEvent, StackFrame} from '@sentry/node';
import type {CrashBreadcrumb} from './crash-diagnostics.js';
import {
  CRASH_REPORT_SCHEMA_VERSION,
  type CrashErrorInfo,
  type CrashOrigin,
  type CrashReport,
  MAX_CAUSE_DEPTH,
  ownPackageAppPath,
  parseCrashReport,
  redactPaths,
  resolveCrashReportPath,
} from './crash-report.js';
import {CrashReportError} from './errors.js';
import {log} from './log.js';
import {isTrackingDisabled} from './telemetry.js';

const FLUSH_TIMEOUT_MS = 4000;
const DSN =
  'https://ff6d321a297bd57d41d0bd254c9dff85@o4506977812938752.ingest.us.sentry.io/4511779671703552';
const ISSUES_URL = 'https://github.com/coveo/ui-kit/issues';
const DEFAULT_ENVIRONMENT = 'production';

function crashTimestampSeconds(crashedOn: string): number | undefined {
  const milliseconds = Date.parse(crashedOn);
  return Number.isNaN(milliseconds) ? undefined : milliseconds / 1000;
}

function toSentryBreadcrumb(breadcrumb: CrashBreadcrumb): Breadcrumb {
  const timestamp = crashTimestampSeconds(breadcrumb.timestamp);
  return {
    category: 'create-ui.lifecycle',
    message: breadcrumb.type,
    level: breadcrumb.type.endsWith('.failed') ? 'error' : 'info',
    ...(timestamp === undefined ? {} : {timestamp}),
  };
}

function applyCrashMechanism(event: ErrorEvent, origin: CrashOrigin): void {
  const topLevelException = event.exception?.values?.at(-1);
  if (topLevelException === undefined) {
    return;
  }
  topLevelException.mechanism = {
    type: origin === 'unknown' ? 'generic' : origin,
    handled: false,
  };
}

function redactOptional(value: string | undefined): string | undefined {
  return value === undefined ? undefined : redactPaths(value);
}

function scrubEventMessages(event: ErrorEvent): void {
  event.message = redactOptional(event.message);
  for (const exception of event.exception?.values ?? []) {
    exception.value = redactOptional(exception.value);
  }
}

// Older schema-compatible reports may contain the CLI's full install path,
// which — when run through `npm create` / npx — lives under
// `node_modules/@coveo/create-ui`. Sentry's server-side grouping
// (`normalize_stacktraces_for_grouping`) marks anything under `node_modules` as
// a system frame and collapses it, overriding whatever `in_app` the SDK sends.
// Repeating the capture-side `app:///…` normalization here keeps those reports
// expanded and grouped while stripping any machine-specific install prefix.
const NODE_MODULES = /[/\\]node_modules[/\\]/;

// `abs_path` is the field Sentry's server matches on, so own frames rewrite
// both it and `filename`, and drop `module` so no `node_modules`-derived name
// survives. Every other frame keeps its structure with the home directory
// redacted to `~`; only Node internals and real dependencies stay out of app.
function normalizeFrame(frame: StackFrame): void {
  const source = frame.abs_path ?? frame.filename;
  const appPath = source === undefined ? undefined : ownPackageAppPath(source);
  if (appPath !== undefined) {
    frame.filename = appPath;
    frame.abs_path = appPath;
    frame.module = undefined;
    frame.in_app = true;
    return;
  }
  frame.filename = redactOptional(frame.filename);
  frame.abs_path = redactOptional(frame.abs_path);
  frame.module = redactOptional(frame.module);
  frame.in_app =
    source !== undefined &&
    !source.startsWith('node:') &&
    !NODE_MODULES.test(source);
}

function normalizeFrames(event: ErrorEvent): void {
  for (const exception of event.exception?.values ?? []) {
    for (const frame of exception.stacktrace?.frames ?? []) {
      normalizeFrame(frame);
    }
  }
}

async function readReport(path: string): Promise<CrashReport> {
  return parseCrashReport(await readFile(path, 'utf8'));
}

// Rebuild the captured error and its scrubbed cause chain as linked Error
// instances so `linkedErrorsIntegration` expands them into `exception.values`,
// where the `beforeSend` scrubbers already run on every entry. `stack` is set
// verbatim (undefined when absent) so no submit-time frames are fabricated.
function reconstructError(info: CrashErrorInfo, depth = 0): Error {
  const error = new Error(info.message);
  error.name = info.name;
  error.stack = info.stack;
  if (info.cause !== undefined && depth < MAX_CAUSE_DEPTH) {
    (error as {cause?: unknown}).cause = reconstructError(
      info.cause,
      depth + 1
    );
  }
  return error;
}

async function sendToSentry(report: CrashReport): Promise<boolean> {
  const Sentry = await import('@sentry/node');

  Sentry.init({
    dsn: DSN,
    release: report.metadata.createdWith,
    environment: process.env.SENTRY_ENVIRONMENT ?? DEFAULT_ENVIRONMENT,
    defaultIntegrations: false,
    integrations: [Sentry.linkedErrorsIntegration({limit: MAX_CAUSE_DEPTH})],
    sendDefaultPii: false,
    includeServerName: false,
    maxBreadcrumbs: 0,
    beforeBreadcrumb: () => null,
    beforeSend(event) {
      event.timestamp =
        crashTimestampSeconds(report.crashedOn) ?? event.timestamp;
      event.breadcrumbs =
        report.diagnostics.breadcrumbs.map(toSentryBreadcrumb);
      applyCrashMechanism(event, report.origin);
      normalizeFrames(event);
      scrubEventMessages(event);
      return event;
    },
  });

  const syntheticError = reconstructError(report.error);

  Sentry.captureException(syntheticError, {
    level: 'error',
    tags: {
      run_id: report.runId,
      template: report.metadata.template,
      template_version: report.metadata.templateVersion,
      cli: report.metadata.createdWith,
      node: report.metadata.node,
      package_manager: report.metadata.packageManager,
      os: report.os.platform,
      arch: report.os.arch,
      crash_origin: report.origin,
    },
    contexts: {
      os: {name: report.os.platform, version: report.os.release},
      runtime: {name: 'node', version: report.metadata.node},
      create_ui: {
        phase: report.diagnostics.phase,
        phase_elapsed_ms: report.diagnostics.phaseElapsedMs,
        process_uptime_ms: report.diagnostics.runtime.processUptimeMs,
        memory_rss_bytes: report.diagnostics.runtime.memory.rssBytes,
        memory_heap_total_bytes:
          report.diagnostics.runtime.memory.heapTotalBytes,
        memory_heap_used_bytes: report.diagnostics.runtime.memory.heapUsedBytes,
        memory_external_bytes: report.diagnostics.runtime.memory.externalBytes,
      },
    },
    extra: {
      dependencies: report.metadata.dependencies,
      createdOn: report.metadata.createdOn,
    },
  });

  const flushed = await Sentry.flush(FLUSH_TIMEOUT_MS);
  await Sentry.close(FLUSH_TIMEOUT_MS);
  return flushed;
}

function describeReadFailure(error: unknown, reportPath: string): string {
  if (error instanceof CrashReportError && error.kind === 'version-mismatch') {
    return (
      `This crash report uses schema version ${error.reportVersion}, ` +
      `but this CLI version only supports version ${CRASH_REPORT_SCHEMA_VERSION}. ` +
      'Regenerate the report with the latest create-ui, or attach it to an issue:\n' +
      `  ${ISSUES_URL}`
    );
  }
  if (error instanceof CrashReportError) {
    return (
      `The file at "${reportPath}" is not a valid create-ui crash report. ` +
      'Pass the exact path that was printed when the error occurred.'
    );
  }
  const detail = error instanceof Error ? error.message : 'unknown error';
  return `Could not read "${reportPath}": ${detail}.`;
}

async function readReportOrExplain(
  reportPath: string
): Promise<CrashReport | null> {
  try {
    return await readReport(reportPath);
  } catch (error) {
    log.error(describeReadFailure(error, reportPath));
    return null;
  }
}

async function sendReport(report: CrashReport): Promise<number> {
  try {
    const sent = await sendToSentry(report);
    if (sent) {
      log.success(`Thank you! Crash report ${report.runId} was submitted.`);
      return 0;
    }
    log.warn(
      'The crash report could not be sent before timing out (check your network).'
    );
    return 1;
  } catch {
    log.error(
      `Failed to send the crash report. You can attach it to an issue instead:\n  ${ISSUES_URL}`
    );
    return 1;
  }
}

export async function submitReport(
  reportReferenceOrPath: string | undefined
): Promise<number> {
  if (
    reportReferenceOrPath === undefined ||
    reportReferenceOrPath.trim().length === 0
  ) {
    log.error('Usage: npx @coveo/create-ui report <reference-or-path>');
    return 1;
  }

  const reportPath = resolveCrashReportPath(reportReferenceOrPath);

  if (isTrackingDisabled()) {
    log.info(
      'DO_NOT_TRACK is set — the crash report was not sent. You can delete ' +
        `the file whenever you like:\n  ${reportPath}`
    );
    return 0;
  }

  const report = await readReportOrExplain(reportPath);
  if (report === null) {
    return 1;
  }

  return sendReport(report);
}
