import type express from 'express';

const uuid = () => crypto?.randomUUID?.() ?? '';

export function getNavigatorContext({headers, url}: express.Request) {
  const h = (k: string) =>
    (Array.isArray(headers[k]) ? headers[k][0] : headers[k])?.toString();

  return {
    clientId: h('x-coveo-client-id') ?? uuid(),
    location: url ?? h('x-href') ?? null,
    referrer: h('referer') ?? h('referrer') ?? null,
    userAgent: h('user-agent') ?? null,
    forwardedFor: h('x-forwarded-for') ?? h('x-forwarded-host') ?? undefined,
    capture: false,
  };
}
