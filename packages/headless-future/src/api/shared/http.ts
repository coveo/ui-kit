/**
 * Layer 1: API Client - HTTP Utilities
 *
 * Base HTTP utility that reads configuration from state and provides
 * authenticated requests to the Coveo Platform APIs.
 *
 * Architecture constraints:
 * - Only imports from Layer 0 (core state interface)
 * - Never imports Redux directly
 * - Follows engine-first pattern
 * - Reads config from state, never accepts it as parameters
 */

import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import * as configurationSelectors from '@/src/core/interface/configuration/configuration-selectors.js';
import {isSuccessResponse, transformError} from './error-handling.js';

/**
 * Default Coveo Platform API endpoint
 */
const DEFAULT_COVEO_ENDPOINT = 'https://platform.cloud.coveo.com';

/**
 * HTTP request options for Coveo API calls
 */
export interface HttpRequestOptions {
  /**
   * API path relative to the base endpoint (e.g., '/rest/search/v2')
   */
  path: string;

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
 * Execute an HTTP request to the Coveo Platform API.
 *
 * Reads configuration (organizationId, accessToken, endpoint) from engine state.
 * Returns a typed response with success/error status instead of throwing exceptions.
 */
export async function executeHttpRequest<T>(
  engine: FullEngine,
  options: HttpRequestOptions
): Promise<HttpResponse<T>> {
  try {
    const orgId = engine.read(configurationSelectors.organizationId);
    const token = engine.read(configurationSelectors.accessToken);
    const customEndpoint = engine.read(configurationSelectors.endpoint);

    if (!orgId) {
      return {
        success: false,
        error:
          'Configuration error: Organization ID is not set. Please configure your organization ID.',
      };
    }

    if (!token) {
      return {
        success: false,
        error:
          'Configuration error: Access token is not set. Please configure your access token.',
      };
    }

    const baseEndpoint = customEndpoint || DEFAULT_COVEO_ENDPOINT;
    const url = `${baseEndpoint}${options.path}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    const requestInit: RequestInit = {
      method: options.method,
      headers,
    };

    if (options.body && options.method !== 'GET') {
      requestInit.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, requestInit);

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
