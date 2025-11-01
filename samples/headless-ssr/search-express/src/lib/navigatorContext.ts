/**
 * Navigator Context Builder
 *
 * Extracts browser and request context information for Coveo analytics and personalization.
 * This data helps Coveo understand user behavior and improve search relevance.
 */
import {randomUUID} from 'node:crypto';
import type express from 'express';

const getHeaderValue = (
  headerName: string,
  headers: express.Request['headers']
) => {
  const value = headers[headerName];
  const str = (Array.isArray(value) ? value[0] : value)?.toString();
  return str ? str.trim() : undefined;
};

/**
 * Builds navigator context from Express request
 *
 * @param request - Express request object containing headers and metadata
 * @returns Navigator context for Coveo analytics
 */
export function getNavigatorContext({headers, url, ip}: express.Request) {
  return {
    // Unique client identifier for session tracking
    clientId: getHeaderValue('x-coveo-client-id', headers) ?? randomUUID(),

    // Current page location for analytics context
    location: url ?? getHeaderValue('x-href', headers) ?? null,

    // Referrer information to understand user navigation patterns
    referrer:
      getHeaderValue('referer', headers) ??
      getHeaderValue('referrer', headers) ??
      null,

    // User agent for device and browser detection
    userAgent: getHeaderValue('user-agent', headers) ?? null,

    // IP address and forwarding info for geographic context
    forwardedFor:
      getHeaderValue('x-forwarded-for', headers) ||
      getHeaderValue('x-forwarded-host', headers) ||
      ip ||
      undefined,

    // Disable automatic click capture (manual tracking preferred)
    capture: false,
  };
}
