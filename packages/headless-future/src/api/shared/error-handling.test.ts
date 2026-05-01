/**
 * Error Handling Utilities Tests
 */

import {describe, it, expect} from 'vitest';
import {transformError, isSuccessResponse} from './error-handling.js';

describe('transformError()', () => {
  describe('Network errors', () => {
    it('should handle fetch TypeError', () => {
      const error = new TypeError('fetch failed');
      const message = transformError(error);

      expect(message).toBe(
        'Network error: Unable to connect to the server. Please check your internet connection.'
      );
    });

    it('should handle other TypeErrors without fetch', () => {
      const error = new TypeError('something else');
      const message = transformError(error);

      expect(message).toBe('something else');
    });
  });

  describe('HTTP Response errors', () => {
    it('should handle 401 Unauthorized', () => {
      const response = new Response(null, {
        status: 401,
        statusText: 'Unauthorized',
      });
      const message = transformError(response);

      expect(message).toBe(
        'Authentication failed: Invalid or expired access token. Please check your credentials.'
      );
    });

    it('should handle 403 Forbidden', () => {
      const response = new Response(null, {
        status: 403,
        statusText: 'Forbidden',
      });
      const message = transformError(response);

      expect(message).toBe(
        'Access denied: You do not have permission to access this resource.'
      );
    });

    it('should handle 400 Bad Request', () => {
      const response = new Response(null, {
        status: 400,
        statusText: 'Bad Request',
      });
      const message = transformError(response);

      expect(message).toBe(
        'Bad request: The search query or parameters are invalid. Please check your input.'
      );
    });

    it('should handle 404 Not Found', () => {
      const response = new Response(null, {
        status: 404,
        statusText: 'Not Found',
      });
      const message = transformError(response);

      expect(message).toBe(
        'Not found: The requested resource does not exist. Please verify your organization ID.'
      );
    });

    it('should handle 429 Rate Limit', () => {
      const response = new Response(null, {
        status: 429,
        statusText: 'Too Many Requests',
      });
      const message = transformError(response);

      expect(message).toBe(
        'Rate limit exceeded: Too many requests. Please wait a moment and try again.'
      );
    });

    it('should handle 500 Internal Server Error', () => {
      const response = new Response(null, {
        status: 500,
        statusText: 'Internal Server Error',
      });
      const message = transformError(response);

      expect(message).toBe(
        'Server error: The Coveo platform is experiencing issues. Please try again later.'
      );
    });

    it('should handle 502 Bad Gateway', () => {
      const response = new Response(null, {
        status: 502,
        statusText: 'Bad Gateway',
      });
      const message = transformError(response);

      expect(message).toBe(
        'Server error: The Coveo platform is experiencing issues. Please try again later.'
      );
    });

    it('should handle 503 Service Unavailable', () => {
      const response = new Response(null, {
        status: 503,
        statusText: 'Service Unavailable',
      });
      const message = transformError(response);

      expect(message).toBe(
        'Server error: The Coveo platform is experiencing issues. Please try again later.'
      );
    });

    it('should handle 504 Gateway Timeout', () => {
      const response = new Response(null, {
        status: 504,
        statusText: 'Gateway Timeout',
      });
      const message = transformError(response);

      expect(message).toBe(
        'Server error: The Coveo platform is experiencing issues. Please try again later.'
      );
    });

    it('should handle unknown HTTP status codes', () => {
      const response = new Response(null, {
        status: 418,
        statusText: "I'm a teapot",
      });
      const message = transformError(response);

      expect(message).toBe("HTTP 418: I'm a teapot");
    });
  });

  describe('Generic Error objects', () => {
    it('should extract message from Error objects', () => {
      const error = new Error('Custom error message');
      const message = transformError(error);

      expect(message).toBe('Custom error message');
    });
  });

  describe('Unknown error types', () => {
    it('should handle unknown error types', () => {
      const error = {foo: 'bar'};
      const message = transformError(error);

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle null', () => {
      const message = transformError(null);

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle undefined', () => {
      const message = transformError(undefined);

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle string errors', () => {
      const message = transformError('string error');

      expect(message).toBe('An unexpected error occurred. Please try again.');
    });
  });
});

describe('isSuccessResponse()', () => {
  it('should return true for 200 OK', () => {
    const response = new Response(null, {status: 200, statusText: 'OK'});

    expect(isSuccessResponse(response)).toBe(true);
  });

  it('should return true for 201 Created', () => {
    const response = new Response(null, {status: 201, statusText: 'Created'});

    expect(isSuccessResponse(response)).toBe(true);
  });

  it('should return true for 204 No Content', () => {
    const response = new Response(null, {
      status: 204,
      statusText: 'No Content',
    });

    expect(isSuccessResponse(response)).toBe(true);
  });

  it('should return false for 400 Bad Request', () => {
    const response = new Response(null, {
      status: 400,
      statusText: 'Bad Request',
    });

    expect(isSuccessResponse(response)).toBe(false);
  });

  it('should return false for 401 Unauthorized', () => {
    const response = new Response(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(isSuccessResponse(response)).toBe(false);
  });

  it('should return false for 500 Internal Server Error', () => {
    const response = new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });

    expect(isSuccessResponse(response)).toBe(false);
  });
});
