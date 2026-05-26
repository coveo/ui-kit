/**
 * Layer 1: API Client - HTTP Utilities
 *
 * Base HTTP transport utility for executing requests.
 *
 * Architecture constraints:
 * - Pure transport concern (no engine state reads)
 * - Never imports Redux directly
 * - Reusable across API clients
 */

import {isSuccessResponse, transformError} from './error-handling.js';

/**
 * HTTP request options for Coveo API calls
 */
export interface HttpRequestOptions {
  /**
   * Absolute request URL.
   */
  url: string;

  /**
   * HTTP method
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  /**
   * Request body (will be JSON stringified)
   */
  body?: unknown;

  /**
   * Additional headers to merge with default headers
   */
  headers?: Record<string, string>;
}

/**
 * HTTP response wrapper with typed data
 */
export interface HttpResponse<T> {
  /**
   * Whether the request succeeded
   */
  success: boolean;

  /**
   * Response data (only present if success is true)
   */
  data?: T;

  /**
   * Error message (only present if success is false)
   */
  error?: string;
}

/**
 * Execute an HTTP request.
 *
 * Returns a typed response with success/error status instead of throwing exceptions.
 */
export async function executeHttpRequest<T>(
  options: HttpRequestOptions
): Promise<HttpResponse<T>> {
  try {
    const headers: Record<string, string> = {...options.headers};

    const requestInit: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body && options.method !== 'GET') {
      requestInit.body = JSON.stringify(options.body);
    }

    const response = await fetch(options.url, requestInit);

    if (!isSuccessResponse(response)) {
      return {
        success: false,
        error: transformError(response),
      };
    }

    const data = (await response.json()) as T;

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: transformError(error),
    };
  }
}
