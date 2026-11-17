import type {FullConfig} from '@playwright/test';

const maxAttempts = 3;
const requestTimeoutMs = 15_000;
const retryDelayMs = 2_000;

/**
 * Fails the run before any test starts when a scratch-org site is unreachable.
 * A deleted or expired scratch org still answers (with HTTP 420), so without
 * this check every test would wait for its full timeout instead.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  const results = await Promise.all(
    config.projects.map(async ({name, use}) => {
      const failure = use.baseURL ? await checkSite(use.baseURL) : null;
      return failure ? `- ${name}: ${use.baseURL} (${failure})` : null;
    })
  );
  const unreachableSites = results.filter((result) => result !== null);

  if (unreachableSites.length > 0) {
    throw new Error(
      [
        'Cannot run Quantic Playwright tests because these scratch-org sites are unreachable:',
        ...unreachableSites,
        process.env.CI
          ? 'The scratch orgs were deleted or have expired. Use "Re-run all jobs" to create new ones.'
          : 'Run "pnpm run setup:examples" to recreate the Quantic scratch-org communities.',
      ].join('\n')
    );
  }
}

async function checkSite(url: string): Promise<string | null> {
  let failure = '';
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      if (response.ok) {
        return null;
      }
      failure = `HTTP ${response.status}`;
    } catch (error) {
      failure = error instanceof Error ? error.message : String(error);
    }
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
  return failure;
}
