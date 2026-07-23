// Marks an expected, already-handled failure so the crash funnel skips it —
// avoids brittle message matching on a bare Error.
export class ExpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectedError';
  }
}

export function isExpectedError(error: unknown): boolean {
  if (error instanceof ExpectedError) {
    return true;
  }
  // ExitPromptError is raised when the user presses Ctrl-C during a prompt.
  return error instanceof Error && error.name === 'ExitPromptError';
}
