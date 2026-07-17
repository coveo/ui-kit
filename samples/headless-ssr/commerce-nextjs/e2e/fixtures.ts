// All API calls — both server-side (SSR) and client-side (hydration /
// interactions) — are routed to the @mswjs/http-middleware mock server via
// the engine's proxyBaseUrl configuration.  No browser-level interception is
// needed here.
export {test, expect} from '@playwright/test';
