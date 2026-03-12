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

export function getNavigatorContext({headers, url, ip}: express.Request) {
  return {
    clientId: getHeaderValue('x-coveo-client-id', headers) ?? randomUUID(),
    location: url ?? getHeaderValue('x-href', headers) ?? null,
    referrer:
      getHeaderValue('referer', headers) ??
      getHeaderValue('referrer', headers) ??
      null,
    userAgent: getHeaderValue('user-agent', headers) ?? null,
    forwardedFor:
      getHeaderValue('x-forwarded-for', headers) ||
      getHeaderValue('x-forwarded-host', headers) ||
      ip ||
      undefined,
    capture: false,
  };
}
