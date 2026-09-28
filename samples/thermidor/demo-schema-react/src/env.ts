import {PUBLIC_SAMPLE_CONFIGURATION} from './public-sample-configuration.js';

type RequiredEnvKey =
  | 'VITE_COVEO_ORGANIZATION_ID'
  | 'VITE_COVEO_TRACKING_ID'
  | 'VITE_COVEO_LANGUAGE'
  | 'VITE_COVEO_COUNTRY'
  | 'VITE_COVEO_CURRENCY';
type PlatformEnvironment = 'prod' | 'dev' | 'stg' | 'hipaa';

function parseBoolean(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') {
    return true;
  }

  if (normalized === 'false' || normalized === '0' || normalized === 'no') {
    return false;
  }

  return undefined;
}

function getRequiredEnvValue(key: RequiredEnvKey): string {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getOptionalEnvValue(key: string): string | undefined {
  const value = import.meta.env[key];
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function resolvePlatformEnvironment(): PlatformEnvironment {
  const candidate = getOptionalEnvValue('VITE_COVEO_PLATFORM_ENVIRONMENT');
  if (candidate === 'prod' || candidate === 'dev' || candidate === 'stg' || candidate === 'hipaa') {
    return candidate;
  }

  return 'dev';
}

/**
 * The organization and everything bound to it: credentials, tracking id, locale and
 * platform environment.
 *
 * With no `VITE_COVEO_ORGANIZATION_ID`, {@link PUBLIC_SAMPLE_CONFIGURATION} is applied
 * as a bundle and partial overrides of these keys are ignored. They are not
 * independent: the token and tracking id belong to that organization, and it exists
 * only in production — honouring a stray `VITE_COVEO_PLATFORM_ENVIRONMENT=dev` would
 * point the app at `searchuisamples.orgdev.coveo.com`, which does not exist.
 *
 * Transport settings (`VITE_COVEO_ENDPOINT`, `VITE_COVEO_USE_VITE_PROXY`) are not part
 * of the bundle and are always honoured, since `dev:mock` and `dev:agent-gateway` set
 * them without an organization.
 */
function resolveOrganizationConfiguration() {
  const organizationId = getOptionalEnvValue('VITE_COVEO_ORGANIZATION_ID');

  if (organizationId === undefined) {
    return {
      organizationId: PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_ORGANIZATION_ID,
      accessToken: PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_ACCESS_TOKEN,
      trackingId: PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_TRACKING_ID,
      language: PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_LANGUAGE,
      country: PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_COUNTRY,
      currency: PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_CURRENCY,
      environment: PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_PLATFORM_ENVIRONMENT,
    };
  }

  return {
    organizationId,
    // Optional: mock mode does not use it. For a live backend, set VITE_COVEO_ACCESS_TOKEN.
    accessToken: getOptionalEnvValue('VITE_COVEO_ACCESS_TOKEN') ?? '',
    trackingId: getRequiredEnvValue('VITE_COVEO_TRACKING_ID'),
    language: getRequiredEnvValue('VITE_COVEO_LANGUAGE'),
    country: getRequiredEnvValue('VITE_COVEO_COUNTRY'),
    currency: getRequiredEnvValue('VITE_COVEO_CURRENCY'),
    environment: resolvePlatformEnvironment(),
  };
}

function getOrganizationPlatformEndpoint(
  organizationId: string,
  environment: PlatformEnvironment
): string {
  const environmentSuffix = environment === 'prod' ? '' : environment;
  return `https://${organizationId}.org${environmentSuffix}.coveo.com`;
}

/**
 * The fixed converse path the unified endpoint serves. Since the rework, the
 * Thermidor client POSTs to `endpoint` verbatim (it no longer appends this
 * path), so the sample builds the full URL itself for every flow (proxy,
 * explicit override, or derived platform host).
 */
function getConverseUrl(baseUrl: string, organizationId: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');
  return `${normalizedBase}/api/preview/organizations/${organizationId}/agents/commerce/agui/converse`;
}

function shouldUseViteProxy() {
  const configured = parseBoolean(getOptionalEnvValue('VITE_COVEO_USE_VITE_PROXY'));

  if (configured !== undefined) {
    return configured;
  }

  return import.meta.env.DEV;
}

export function getSampleConfiguration() {
  const {environment, ...organization} = resolveOrganizationConfiguration();
  const endpointOverride = getOptionalEnvValue('VITE_COVEO_ENDPOINT');
  const endpointFromEnvironment = getOrganizationPlatformEndpoint(
    organization.organizationId,
    environment
  );

  const baseUrl = shouldUseViteProxy()
    ? window.location.origin
    : (endpointOverride ?? endpointFromEnvironment);

  return {
    ...organization,
    endpoint: getConverseUrl(baseUrl, organization.organizationId),
  };
}
