/**
 * Layer 1: BrowserTransportAdapter
 *
 * Fetch-based TransportAdapter for browser and edge-function environments.
 * Implements both request/response (`send`) and SSE streaming (`openStream`).
 *
 * Design notes:
 * - Streams are driven by ReadableStreamDefaultReader, matching the pattern
 *   used in barca-sports-hydrogen's `processSSEStream`.
 * - The caller (controller) owns the AbortController and passes `signal` in
 *   StreamRequest; `abort()` cancels any in-flight request managed here.
 * - `getAuthToken` is optional. When provided it is called before each
 *   request; the returned value is attached as `Authorization: Bearer <token>`.
 */

import type {
  TransportAdapter,
  TransportRequest,
  TransportResponse,
  StreamRequest,
} from './types.js';

export type BrowserTransportOptions = {
  /**
   * Base URL prepended to every `path`, e.g. `https://platform.cloud.coveo.com`.
   * Trailing slashes are stripped; path slashes are normalized automatically.
   */
  baseUrl: string;

  /**
   * Optional auth token provider. Called before every `send` and `openStream`
   * request. The transport itself does not cache the token — the AuthAdapter
   * or caller is expected to do so.
   */
  getAuthToken?: () => Promise<string>;

  /**
   * Additional headers merged into every outgoing request. Useful for
   * framework-level headers such as agent-runtime selection.
   */
  defaultHeaders?: Record<string, string>;
};

export class BrowserTransportAdapter implements TransportAdapter {
  private readonly baseUrl: string;
  private readonly getAuthToken?: () => Promise<string>;
  private readonly defaultHeaders: Record<string, string>;

  /**
   * Tracks the active stream's AbortController so `abort()` can cancel it.
   * Only one concurrent stream per adapter instance is expected.
   */
  private activeStreamController: AbortController | null = null;

  constructor(options: BrowserTransportOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.getAuthToken = options.getAuthToken;
    this.defaultHeaders = options.defaultHeaders ?? {};
  }

  async send(request: TransportRequest): Promise<TransportResponse> {
    const url = this.resolveUrl(request.path);
    const headers = await this.buildHeaders({
      'Content-Type': 'application/json',
    });

    const response = await fetch(url, {
      method: request.method,
      headers,
      body:
        request.body !== undefined ? JSON.stringify(request.body) : undefined,
      signal: request.signal,
    });

    let data: unknown;
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {status: response.status, data};
  }

  async openStream(request: StreamRequest): Promise<void> {
    const url = this.resolveUrl(request.path);
    const headers = await this.buildHeaders({
      'Content-Type': 'application/json; charset=UTF-8',
      Accept: 'text/event-stream;charset=UTF-8',
    });

    const internalController = new AbortController();
    this.activeStreamController = internalController;

    // If the caller passes an external signal, wire it so that aborting the
    // external signal also aborts the internal one.
    const externalSignal = request.signal;
    if (externalSignal) {
      if (externalSignal.aborted) {
        this.activeStreamController = null;
        return;
      }
      externalSignal.addEventListener('abort', () => {
        internalController.abort(externalSignal.reason);
      });
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers,
        body:
          request.body !== undefined ? JSON.stringify(request.body) : undefined,
        signal: internalController.signal,
      });
    } catch (error) {
      this.activeStreamController = null;
      if ((error as DOMException)?.name === 'AbortError') {
        return;
      }
      request.onError({
        code: 'NETWORK_ERROR',
        message: (error as Error)?.message ?? 'Network error',
      });
      return;
    }

    if (!response.ok || !response.body) {
      this.activeStreamController = null;
      const message = await response.text().catch(() => '');
      request.onError({
        code: `HTTP_${response.status}`,
        message: message || `HTTP ${response.status}`,
      });
      return;
    }

    const reader = response.body.getReader();

    try {
      while (true) {
        const {value, done} = await reader.read();

        if (done) {
          break;
        }

        request.onChunk(value);
      }

      request.onClose();
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') {
        // Normal abort — do not surface as error
        return;
      }
      request.onError({
        code: 'STREAM_READ_ERROR',
        message: (error as Error)?.message ?? 'Stream read error',
      });
    } finally {
      reader.releaseLock();
      this.activeStreamController = null;
    }
  }

  abort(reason?: string): void {
    this.activeStreamController?.abort(reason);
    this.activeStreamController = null;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private resolveUrl(path: string): string {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseUrl}${normalizedPath}`;
  }

  private async buildHeaders(
    base: Record<string, string>
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...base,
    };

    if (this.getAuthToken) {
      const token = await this.getAuthToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }
}
