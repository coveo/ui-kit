/**
 * Minimal HTTP transport: a `fetch` wrapper with one retry and a clear error.
 * Shared by the registry resolver (`registry.ts`) and the tarball download
 * (`download.ts`).
 */

type FetchImpl = typeof fetch;

/** User-Agent sent on every request (polite; some proxies reject requests without one). */
const USER_AGENT = 'coveo-create-ui';

/**
 * Carries the HTTP status of a non-ok response so callers can branch on it
 * (e.g. a 404 from the registry meaning "package not found").
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    statusText: string
  ) {
    super(`${status} ${statusText}`);
    this.name = 'HttpError';
  }
}

/**
 * Fetches a URL, retrying once on a network failure or a 5xx response. A 4xx is
 * thrown immediately as an `HttpError` without retrying, since it will not
 * change on a retry. Follows redirects (tarball URLs may 302 to a CDN).
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
  const headers = {'User-Agent': USER_AGENT, ...options.headers};
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchImpl(url, {headers, redirect: 'follow'});
      if (response.ok && response.body) {
        return response;
      }
      // Free the socket before retrying or throwing.
      await response.body?.cancel();
      const httpError = new HttpError(response.status, response.statusText);
      // Client errors won't change on retry — fail fast.
      if (response.status >= 400 && response.status < 500) {
        throw httpError;
      }
      lastError = httpError;
    } catch (error) {
      if (
        error instanceof HttpError &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw error;
      }
      lastError = error;
    }
  }

  const reason =
    lastError instanceof Error ? lastError.message : String(lastError);
  throw new Error(
    `Failed to fetch ${url} (${reason}). Check your network connection and try again.`
  );
}
