/**
 * Throwing this (rather than a bare `Error`) marks the failure as "no crash report
 * needed" without relying on brittle message matching.
 */
export class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

/**
 * True when the error is a normal, expected outcome that should not produce a
 * crash report: an {@link ExpectedError}, or an `ExitPromptError` raised when
 * the user presses Ctrl-C during an interactive prompt.
 */
export function isExpectedError(error: unknown): boolean {
  if (error instanceof ExpectedError) {
    return true;
  }
  return error instanceof Error && error.name === 'ExitPromptError';
}
