/**
 * Credentials for the public `searchuisamples` organization — the same org and
 * intentionally-public API key the other samples use through
 * `getSampleSearchEngineConfiguration()`. This organization has the commerce
 * agent enabled, so the sample runs with no configuration at all, which is what
 * lets it be opened straight from a pkg.pr.new preview link.
 *
 * Shared between `src/env.ts` (browser) and `vite.config.ts` (dev-server proxy)
 * so both ends agree on which organization they are talking to. It deliberately
 * reads no environment variables, since `vite.config.ts` needs these values
 * before `import.meta.env` exists.
 *
 * Applied as a BUNDLE, and only when `VITE_COVEO_ORGANIZATION_ID` is unset: the
 * tracking id, locale and platform environment all belong to this org, so
 * mixing them with a different organization would produce a subtly broken
 * configuration. Setting an organization therefore opts out of every default
 * here, preserving the previous behaviour for anyone with a `.env.local`.
 */
export const PUBLIC_SAMPLE_CONFIGURATION = {
  VITE_COVEO_ORGANIZATION_ID: 'searchuisamples',
  VITE_COVEO_ACCESS_TOKEN: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
  VITE_COVEO_TRACKING_ID: 'sports-ui-samples',
  VITE_COVEO_LANGUAGE: 'en',
  VITE_COVEO_COUNTRY: 'US',
  VITE_COVEO_CURRENCY: 'USD',
  // `searchuisamples` is a production organization; it has no `dev` counterpart.
  VITE_COVEO_PLATFORM_ENVIRONMENT: 'prod',
} as const;
