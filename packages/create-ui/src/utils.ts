/**
 * Shared helpers: logging, error formatting, and package-manager detection.
 */

/** Extracts a clean user-facing message from any thrown value. Never returns a stack trace. */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message || 'An unexpected error occurred.';
  }
  if (typeof error === 'string' && error.length > 0) {
    return error;
  }
  return 'An unexpected error occurred.';
}

const appendCmdIfWindows = (cmd: string) =>
  `${cmd}${process.platform === 'win32' ? '.ps1' : ''}`;

const DEFAULT_PACKAGE_MANAGER = 'npm';

export function getPackageManager(noCmd = false) {
  const firstUserAgent = /^\w+(?=\/)/;
  const packageManager =
    process.env.npm_config_user_agent?.match(firstUserAgent)?.[0] ??
    DEFAULT_PACKAGE_MANAGER;
  return noCmd ? packageManager : appendCmdIfWindows(packageManager);
}

export const log = {
  info(message: string): void {
    console.log(message);
  },
  step(message: string): void {
    console.log(`\n${message}`);
  },
  success(message: string): void {
    console.log(`✓ ${message}`);
  },
  warn(message: string): void {
    console.warn(`⚠ ${message}`);
  },
  error(message: string): void {
    console.error(`✗ ${message}`);
  },
};
