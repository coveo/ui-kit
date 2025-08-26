import type express from 'express';

const uuid = () => crypto?.randomUUID?.() ?? '';

const getHeaderValue = (
  headerName: string,
  headers: express.Request['headers']
) => {
  const value = headers[headerName];

  return (Array.isArray(value) ? value[0] : value)?.toString();
};

export function getNavigatorContext({headers, url}: express.Request) {
  return {
    clientId: getHeaderValue('x-coveo-client-id', headers) ?? uuid(),
    location: url ?? getHeaderValue('x-href', headers) ?? null,
    referrer:
      getHeaderValue('referer', headers) ??
      getHeaderValue('referrer', headers) ??
      null,
    userAgent: getHeaderValue('user-agent', headers) ?? null,
    forwardedFor:
      getHeaderValue('x-forwarded-for', headers) ??
      getHeaderValue('x-forwarded-host', headers) ??
      undefined,
    capture: false,
  };
}
