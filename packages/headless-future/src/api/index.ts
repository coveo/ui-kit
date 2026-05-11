/**
 * Layer 1: API Client Module Exports
 *
 * Internal API for headless library.
 * These exports are used by Layer 2 (Controllers) but are NOT
 * exported from the main package entry point.
 *
 * DO NOT add these exports to src/index.ts - Layer 1 is internal only.
 */

// Search API
export {executeSearchAPI} from './search/search.js';

// HTTP utilities (for future API clients)
export {executeHttpRequest} from './shared/http.js';
export type {HttpRequestOptions, HttpResponse} from './shared/http.js';

// Stream utilities (for future conversational clients)
export {readEventStream} from './shared/stream.js';
export type {ReadEventStreamOptions} from './shared/stream.js';

// Error handling utilities (for future API clients)
export {transformError, isSuccessResponse} from './shared/error-handling.js';
