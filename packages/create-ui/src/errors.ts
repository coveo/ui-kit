// Marks an expected, already-handled failure so the crash funnel skips it —
// avoids brittle message matching on a bare Error.
export class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

// Thrown when a requested template version is not published on npm.
export class TemplateVersionUnavailableError extends Error {
  constructor(readonly version: string) {
    super(`Version "${version}" is not available on npm.`);
    this.name = 'TemplateVersionUnavailableError';
  }
}

export type CrashReportErrorKind = 'not-a-report' | 'version-mismatch';

export class CrashReportError extends Error {
  constructor(
    readonly kind: CrashReportErrorKind,
    readonly reportVersion?: number
  ) {
    super(kind);
    this.name = 'CrashReportError';
  }
}

export function isExpectedError(error: unknown): boolean {
  if (error instanceof ExpectedError) {
    return true;
  }
  // ExitPromptError is raised when the user presses Ctrl-C during a prompt.
  return error instanceof Error && error.name === 'ExitPromptError';
}
