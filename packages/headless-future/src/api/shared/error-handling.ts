/**
 * Layer 1: API Client - Error Handling Utilities
 *
 * Transforms HTTP and API errors into user-friendly error messages
 * for state mutations. Never throws exceptions - returns error strings
 * that can be dispatched to state.
 */

/**
 * Transform any error into a user-friendly error message string
 * suitable for storing in state via error mutations.
 *
 * @param error - The error to transform (unknown type from catch blocks)
 * @returns A human-readable error message string
 */
export function transformError(error: unknown): string {
  // Network errors or fetch failures
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'Network error: Unable to connect to the server. Please check your internet connection.';
  }

  // HTTP Response errors with status codes
  if (error instanceof Response) {
    return transformHttpError(error.status, error.statusText);
  }

  // Error objects with message
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Transform HTTP status codes into user-friendly error messages
 *
 * @param status - HTTP status code
 * @param statusText - HTTP status text
 * @returns A human-readable error message
 */
function transformHttpError(status: number, statusText: string): string {
  switch (status) {
    case 401:
      return 'Authentication failed: Invalid or expired access token. Please check your credentials.';

    case 403:
      return 'Access denied: You do not have permission to access this resource.';

    case 400:
      return 'Bad request: The search query or parameters are invalid. Please check your input.';

    case 404:
      return 'Not found: The requested resource does not exist. Please verify your organization ID.';

    case 429:
      return 'Rate limit exceeded: Too many requests. Please wait a moment and try again.';

    case 500:
    case 502:
    case 503:
    case 504:
      return 'Server error: The Coveo platform is experiencing issues. Please try again later.';

    default:
      return `HTTP ${status}: ${statusText}`;
  }
}

/**
 * Checks if a response is successful (2xx status code)
 *
 * @param response - Fetch Response object
 * @returns true if response is successful
 */
export function isSuccessResponse(response: Response): boolean {
  return response.ok && response.status >= 200 && response.status < 300;
}
