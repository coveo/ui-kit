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

/**
 * True when nothing is configured, in which case the sample falls back to
 * {@link PUBLIC_SAMPLE_CONFIGURATION} wholesale.
 */
function isUsingPublicSampleConfiguration(): boolean {
  return getOptionalEnvValue('VITE_COVEO_ORGANIZATION_ID') === undefined;
}

function getRequiredEnvValue(key: RequiredEnvKey): string {
  const value = import.meta.env[key];
  if (!value) {
    if (isUsingPublicSampleConfiguration()) {
      return PUBLIC_SAMPLE_CONFIGURATION[key];
    }

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

  if (isUsingPublicSampleConfiguration()) {
    return PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_PLATFORM_ENVIRONMENT;
  }

  return 'dev';
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
  const organizationId = getRequiredEnvValue('VITE_COVEO_ORGANIZATION_ID');
  const endpointOverride = getOptionalEnvValue('VITE_COVEO_ENDPOINT');
  const environment = resolvePlatformEnvironment();
  const endpointFromEnvironment = getOrganizationPlatformEndpoint(organizationId, environment);

  const baseUrl = shouldUseViteProxy()
    ? window.location.origin
    : (endpointOverride ?? endpointFromEnvironment);
  const endpoint = getConverseUrl(baseUrl, organizationId);

  return {
    organizationId,
    // Optional: mock mode does not use it. For a live backend, set VITE_COVEO_ACCESS_TOKEN.
    accessToken:
      getOptionalEnvValue('VITE_COVEO_ACCESS_TOKEN') ??
      (isUsingPublicSampleConfiguration()
        ? PUBLIC_SAMPLE_CONFIGURATION.VITE_COVEO_ACCESS_TOKEN
        : ''),
    trackingId: getRequiredEnvValue('VITE_COVEO_TRACKING_ID'),
    language: getRequiredEnvValue('VITE_COVEO_LANGUAGE'),
    country: getRequiredEnvValue('VITE_COVEO_COUNTRY'),
    currency: getRequiredEnvValue('VITE_COVEO_CURRENCY'),
    endpoint,
  };
}
