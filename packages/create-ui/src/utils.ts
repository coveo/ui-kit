/**
 * Shared helpers: logging and package-manager detection.
 */

export type PackageManager = 'npm' | 'pnpm';

/**
 * Detects the package manager the user invoked `create` with, via the
 * `npm_config_user_agent` environment variable that npm/pnpm/yarn set.
 * Only npm and pnpm are supported; anything else falls back to npm.
 */
export function detectPackageManager(
  userAgent: string | undefined = process.env.npm_config_user_agent
): PackageManager {
  if (!userAgent) {
    return 'npm';
  }
  const name = userAgent.split(' ')[0]?.split('/')[0];
  return name === 'pnpm' ? 'pnpm' : 'npm';
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
