import {readFile} from 'node:fs/promises';
import type {ErrorEvent} from '@sentry/node';
import fastRedact from 'fast-redact';
import {
  CRASH_REPORT_SCHEMA_VERSION,
  parseCrashReport,
  scrub,
  type CrashReport,
} from './crash-report.js';
import {CrashReportError} from './errors.js';
import {log} from './log.js';
import {isTrackingDisabled} from './telemetry.js';

const FLUSH_TIMEOUT_MS = 4000;
const DSN =
  'https://ff6d321a297bd57d41d0bd254c9dff85@o4506977812938752.ingest.us.sentry.io/4511779671703552';
const ISSUES_URL = 'https://github.com/coveo/ui-kit/issues';

// `censor: undefined` deletes these fields entirely rather than masking them.
const redactEventPii = fastRedact({
  paths: [
    'server_name',
    'user',
    'request',
    'modules',
    'breadcrumbs',
    'contexts.device',
    'contexts.culture',
    'exception.values[*].stacktrace.frames[*].vars',
    'exception.values[*].stacktrace.frames[*].pre_context',
    'exception.values[*].stacktrace.frames[*].context_line',
    'exception.values[*].stacktrace.frames[*].post_context',
  ],
  censor: undefined,
  serialize: false,
});

function crashTimestampSeconds(crashedOn: string): number | undefined {
  const milliseconds = Date.parse(crashedOn);
  return Number.isNaN(milliseconds) ? undefined : milliseconds / 1000;
}

function scrubOptional(value: string | undefined): string | undefined {
  return value === undefined ? undefined : scrub(value);
}

// Credential-shaped values are intentionally left to Sentry's server-side Data
// Scrubbing (ADR 003 #5): CLI crash data is not Customer Data.
function scrubEventPaths(event: ErrorEvent): void {
  event.message = scrubOptional(event.message);
  for (const exception of event.exception?.values ?? []) {
    exception.value = scrubOptional(exception.value);
    for (const frame of exception.stacktrace?.frames ?? []) {
      frame.filename = scrubOptional(frame.filename);
      frame.abs_path = scrubOptional(frame.abs_path);
      frame.module = scrubOptional(frame.module);
    }
  }
}

async function readReport(path: string): Promise<CrashReport> {
  return parseCrashReport(await readFile(path, 'utf8'));
}

async function sendToSentry(report: CrashReport): Promise<boolean> {
  const Sentry = await import('@sentry/node');

  Sentry.init({
    dsn: DSN,
    defaultIntegrations: false,
    integrations: [],
    sendDefaultPii: false,
    maxBreadcrumbs: 0,
    beforeBreadcrumb: () => null,
    beforeSend(event) {
      event.timestamp =
        crashTimestampSeconds(report.crashedOn) ?? event.timestamp;
      redactEventPii(event);
      scrubEventPaths(event);
      return event;
    },
  });

  const syntheticError = new Error(report.error.message);
  syntheticError.name = report.error.name;
  if (report.error.stack !== undefined) {
    syntheticError.stack = report.error.stack;
  }

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
    },
    contexts: {
      os: {name: report.os.platform, version: report.os.release},
      runtime: {name: 'node', version: report.metadata.node},
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
  reportPath: string | undefined
): Promise<number> {
  if (reportPath === undefined || reportPath.trim().length === 0) {
    log.error('Usage: npx @coveo/create-ui report <path-to-report.json>');
    return 1;
  }

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
