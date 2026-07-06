export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred.';
  }
  if (typeof error === 'string' && error.length > 0) {
    return error;
  }
  return 'An unexpected error occurred.';
}

const DEFAULT_PACKAGE_MANAGER = 'npm';

/**
 * Detects the package manager that invoked the CLI (from `npm_config_user_agent`),
 * falling back to npm. Returns the bare command name on every platform.
 */
export function getPackageManager(): string {
  const firstUserAgent = /^\w+(?=\/)/;
  return (
    process.env.npm_config_user_agent?.match(firstUserAgent)?.[0] ??
    DEFAULT_PACKAGE_MANAGER
  );
}
