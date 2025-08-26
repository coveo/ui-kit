import type express from 'express';

const uuid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : '';

export function getNavigatorContext(req: express.Request) {
  const {headers, url} = req;

  const h = (k: string) => {
    const v = headers[k];
    return Array.isArray(v) ? v[0] : v?.toString();
  };

  return {
    clientId: h('x-coveo-client-id') ?? uuid(),
    location: url ?? h('x-href') ?? null,
    referrer: h('referer') ?? h('referrer') ?? null,
    userAgent: h('user-agent') ?? null,
    forwardedFor: h('x-forwarded-for') ?? h('x-forwarded-host') ?? undefined,
    capture: false,
  };
}
