/**
 * Layer 1: DefaultAuthAdapter
 *
 * Token-endpoint–based AuthAdapter for browser and server-side environments.
 * Retrieves an access token from a configurable HTTP endpoint and caches it
 * until it expires (or until `refreshToken()` is called explicitly).
 *
 * Design notes:
 * - Token endpoint is expected to respond with `{"token": "<value>"}`.
 * - Expiry is tracked via an explicit `ttlMs` option (default 5 minutes).
 *   JWT expiry decoding is intentionally omitted: the adapter doesn't trust
 *   or validate token contents — that is the platform's responsibility.
 * - A single in-flight request is coalesced so concurrent `getToken()` calls
 *   do not race and produce duplicate fetches.
 */

import type {AuthAdapter, TokenMetadata} from './types.js';

export type DefaultAuthOptions = {
  /**
   * URL of the token endpoint. Must respond with `{"token": "<value>"}`.
   * Example: `https://my-app.com/token` or `/token` (relative path).
   */
  tokenEndpoint: string;

  /**
   * How long (in milliseconds) a cached token is considered valid.
   * After this period the next `getToken()` call fetches a fresh token.
   * Defaults to 5 minutes (300_000 ms).
   */
  ttlMs?: number;

  /**
   * Additional headers sent with every token fetch request, e.g. for
   * forwarding cookies in server-side environments.
   */
  fetchHeaders?: Record<string, string>;
};

type CachedToken = {
  value: string;
  expiresAt: number;
};

export class DefaultAuthAdapter implements AuthAdapter {
  private readonly tokenEndpoint: string;
  private readonly ttlMs: number;
  private readonly fetchHeaders: Record<string, string>;

  private cache: CachedToken | null = null;
  private inFlight: Promise<string> | null = null;

  constructor(options: DefaultAuthOptions) {
    this.tokenEndpoint = options.tokenEndpoint;
    this.ttlMs = options.ttlMs ?? 300_000;
    this.fetchHeaders = options.fetchHeaders ?? {};
  }

  async getToken(): Promise<string> {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.value;
    }

    return this.fetchAndCache();
  }

  async refreshToken(): Promise<string> {
    this.cache = null;
    return this.fetchAndCache();
  }

  getTokenMetadata(): TokenMetadata {
    if (!this.cache) {
      return {};
    }
    return {expiresAt: this.cache.expiresAt};
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Coalesces concurrent requests into a single in-flight fetch.
   * If a fetch is already running all callers await the same promise.
   */
  private fetchAndCache(): Promise<string> {
    if (this.inFlight) {
      return this.inFlight;
    }

    this.inFlight = this.doFetch().finally(() => {
      this.inFlight = null;
    });

    return this.inFlight;
  }

  private async doFetch(): Promise<string> {
    const response = await fetch(this.tokenEndpoint, {
      headers: this.fetchHeaders,
    });

    if (!response.ok) {
      throw new Error(
        `DefaultAuthAdapter: token endpoint responded with ${response.status} ${response.statusText}`
      );
    }

    const json = (await response.json()) as {token?: string};

    if (typeof json?.token !== 'string' || !json.token) {
      throw new Error(
        `DefaultAuthAdapter: token endpoint did not return a "token" string`
      );
    }

    this.cache = {
      value: json.token,
      expiresAt: Date.now() + this.ttlMs,
    };

    return this.cache.value;
  }
}
