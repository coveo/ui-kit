/**
 * Minimal HTTP transport for GitHub API calls: a single-retry `fetch` wrapper
 * with consistent headers and a clear error. Kept in its own module so both the
 * release resolver (`tarball.ts`) and the tarball download (`download.ts`) can
 * share it without creating a circular import.
 */

type FetchImpl = typeof fetch;

/** User-Agent sent on every GitHub API request (the API rejects requests without one). */
export const USER_AGENT = 'coveo-create-ui';

/**
 * Fetches a URL with one retry on failure, throwing a single clear error if all
 * attempts fail. Follows redirects (the archive endpoint returns a 302).
 * `fetchImpl` is injectable for testing.
 */
export async function fetchWithRetry(
  url: string,
  options: {
    retries?: number;
    fetchImpl?: FetchImpl;
    headers?: Record<string, string>;
  } = {}
): Promise<Response> {
  const retries = options.retries ?? 1;
  const fetchImpl = options.fetchImpl ?? fetch;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchImpl(url, {
        headers: options.headers,
        redirect: 'follow',
      });
      if (response.ok && response.body) {
        return response;
      }
      // Drain the body to free resources before retrying.
      await response.body?.cancel();
      lastError = new Error(`${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error;
    }
  }

  const reason =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Failed to fetch ${url} (${reason}). Check your network connection and try again.`
  );
}
